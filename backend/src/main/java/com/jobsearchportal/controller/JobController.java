package com.jobsearchportal.controller;

import com.jobsearchportal.dto.JobDTO;
import com.jobsearchportal.entity.Job;
import com.jobsearchportal.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<JobDTO> createJob(@RequestBody JobDTO jobDTO) {
        Job job = new Job(
                jobDTO.getPosition(),
                jobDTO.getCompanyId(),
                jobDTO.getLocation(),
                jobDTO.getExperience(),
                jobDTO.getDescription(),
                jobDTO.getSkills(),
                jobDTO.getJobType()
        );
        Job savedJob = jobService.createJob(job);
        JobDTO savedDTO = new JobDTO(
                savedJob.getId(),
                savedJob.getPosition(),
                savedJob.getCompanyId(),
                savedJob.getLocation(),
                savedJob.getExperience(),
                savedJob.getDescription(),
                savedJob.getSkills(),
                savedJob.getJobType()
        );
        return new ResponseEntity<>(savedDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDTO> updateJob(@PathVariable String id, @RequestBody JobDTO jobDTO) {
        Job job = new Job(
                jobDTO.getPosition(),
                jobDTO.getCompanyId(),
                jobDTO.getLocation(),
                jobDTO.getExperience(),
                jobDTO.getDescription(),
                jobDTO.getSkills(),
                jobDTO.getJobType()
        );
        Job updatedJob = jobService.updateJob(id, job);
        JobDTO updatedDTO = new JobDTO(
                updatedJob.getId(),
                updatedJob.getPosition(),
                updatedJob.getCompanyId(),
                updatedJob.getLocation(),
                updatedJob.getExperience(),
                updatedJob.getDescription(),
                updatedJob.getSkills(),
                updatedJob.getJobType()
        );
        return new ResponseEntity<>(updatedDTO, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        jobService.deleteJob(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> getJobById(@PathVariable String id) {
        Job job = jobService.findJobById(id);
        JobDTO jobDTO = new JobDTO(
                job.getId(),
                job.getPosition(),
                job.getCompanyId(),
                job.getLocation(),
                job.getExperience(),
                job.getDescription(),
                job.getSkills(),
                job.getJobType()
        );
        return new ResponseEntity<>(jobDTO, HttpStatus.OK);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobDTO>> getJobsByCompanyId(@PathVariable String companyId) {
        List<JobDTO> jobDTOs = jobService.findJobsByCompanyId(companyId).stream()
                .map(job -> new JobDTO(
                        job.getId(),
                        job.getPosition(),
                        job.getCompanyId(),
                        job.getLocation(),
                        job.getExperience(),
                        job.getDescription(),
                        job.getSkills(),
                        job.getJobType()
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(jobDTOs, HttpStatus.OK);
    }

    @GetMapping("/search/position/{position}")
    public ResponseEntity<List<JobDTO>> searchJobsByPosition(@PathVariable String position) {
        List<JobDTO> jobDTOs = jobService.findJobsByPosition(position).stream()
                .map(job -> new JobDTO(
                        job.getId(),
                        job.getPosition(),
                        job.getCompanyId(),
                        job.getLocation(),
                        job.getExperience(),
                        job.getDescription(),
                        job.getSkills(),
                        job.getJobType()
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(jobDTOs, HttpStatus.OK);
    }

    @GetMapping("/search/skill/{skill}")
    public ResponseEntity<List<JobDTO>> searchJobsBySkill(@PathVariable String skill) {
        List<JobDTO> jobDTOs = jobService.findJobsBySkill(skill).stream()
                .map(job -> new JobDTO(
                        job.getId(),
                        job.getPosition(),
                        job.getCompanyId(),
                        job.getLocation(),
                        job.getExperience(),
                        job.getDescription(),
                        job.getSkills(),
                        job.getJobType()
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(jobDTOs, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<JobDTO>> findAllJobs() {
        List<JobDTO> jobDTOs = jobService.findAllJobs().stream()
                .map(job -> new JobDTO(
                        job.getId(),
                        job.getPosition(),
                        job.getCompanyId(),
                        job.getLocation(),
                        job.getExperience(),
                        job.getDescription(),
                        job.getSkills(),
                        job.getJobType()
                ))
                .collect(Collectors.toList());

        return new ResponseEntity<>(jobDTOs, HttpStatus.OK);
    }

}