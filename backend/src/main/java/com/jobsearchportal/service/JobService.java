package com.jobsearchportal.service;

import com.jobsearchportal.entity.Company;
import com.jobsearchportal.entity.Job;
import com.jobsearchportal.repository.CompanyRepository;
import com.jobsearchportal.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import java.util.List;
import java.util.Set;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private Validator validator;

    public Job createJob(Job job) {
        // Validate entity
        Set<ConstraintViolation<Job>> violations = validator.validate(job);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Validate companyId
        Company company = companyRepository.findById(job.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + job.getCompanyId()));

        // Set audit fields
        job.onCreate();

        // Save job
        Job savedJob = jobRepository.save(job);

        // Update company's jobIds
        company.addJobId(savedJob.getId());
        companyRepository.save(company);

        return savedJob;
    }

    public Job updateJob(String id, Job updatedJob) {
        // Validate entity
        Set<ConstraintViolation<Job>> violations = validator.validate(updatedJob);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Find existing job
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + id));

        // Validate companyId
        if (!job.getCompanyId().equals(updatedJob.getCompanyId())) {
            companyRepository.findById(updatedJob.getCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + updatedJob.getCompanyId()));
        }

        // Update fields
        job.setPosition(updatedJob.getPosition());
        job.setCompanyId(updatedJob.getCompanyId());
        job.setLocation(updatedJob.getLocation());
        job.setExperience(updatedJob.getExperience());
        job.setDescription(updatedJob.getDescription());
        job.setSkills(updatedJob.getSkills());
        job.setJobType(updatedJob.getJobType());
        job.onUpdate();

        return jobRepository.save(job);
    }

    public void deleteJob(String id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + id));

        // Remove jobId from company
        Company company = companyRepository.findById(job.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + job.getCompanyId()));
        company.removeJobId(id);
        companyRepository.save(company);

        jobRepository.deleteById(id);
    }

    public Job findJobById(String id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + id));
    }

    public List<Job> findJobsByCompanyId(String companyId) {
        return jobRepository.findByCompanyId(companyId);
    }
    public List<Job> findJobsByLocation(String location) {return jobRepository.findByLocation(location);}

    public List<Job> findJobsByPosition(String position) {
        return jobRepository.findByPositionContainingIgnoreCase(position);
    }
    public List<Job> findAllJobs() {
        return jobRepository.findAll();
    }

    public List<Job> findJobsBySkill(String skill) {
        return jobRepository.findBySkillsContaining(skill);
    }
}