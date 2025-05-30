package com.jobsearchportal.controller;

import com.jobsearchportal.dto.JobApplicationDTO;
import com.jobsearchportal.entity.JobApplication;
import com.jobsearchportal.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @PostMapping
    public ResponseEntity<JobApplicationDTO> createJobApplication(@RequestBody JobApplicationDTO jobApplicationDTO) {
        JobApplication jobApplication = new JobApplication(
                jobApplicationDTO.getCandidateId(),
                jobApplicationDTO.getJobId(),
                jobApplicationDTO.getQualification(),
                jobApplicationDTO.getResumeLink(),
                jobApplicationDTO.getStatus()
        );
        JobApplication savedJobApplication = jobApplicationService.createJobApplication(jobApplication);
        JobApplicationDTO savedDTO = new JobApplicationDTO(
                savedJobApplication.getId(),
                savedJobApplication.getCandidateId(),
                savedJobApplication.getJobId(),
                savedJobApplication.getQualification(),
                savedJobApplication.getResumeLink(),
                savedJobApplication.getStatus()
        );
        return new ResponseEntity<>(savedDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateJobStatus(@PathVariable String id, @RequestParam String status) {

        JobApplication updatedJobApplication = jobApplicationService.updateJobStatus(id, status);

        return new ResponseEntity<>(updatedJobApplication, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobApplication(@PathVariable String id) {
        jobApplicationService.deleteJobApplication(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getJobApplicationById(@PathVariable String id) {
        JobApplication jobApplication = jobApplicationService.findJobApplicationById(id);
        JobApplicationDTO jobApplicationDTO = new JobApplicationDTO(
                jobApplication.getId(),
                jobApplication.getCandidateId(),
                jobApplication.getJobId(),
                jobApplication.getQualification(),
                jobApplication.getResumeLink(),
                jobApplication.getStatus()
        );
        return new ResponseEntity<>(jobApplicationDTO, HttpStatus.OK);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<JobApplicationDTO>> getJobApplicationsByCandidateId(@PathVariable String candidateId) {
        List<JobApplicationDTO> jobApplicationDTOs = jobApplicationService.findJobApplicationsByCandidateId(candidateId).stream()
                .map(jobApplication -> new JobApplicationDTO(
                        jobApplication.getId(),
                        jobApplication.getCandidateId(),
                        jobApplication.getJobId(),
                        jobApplication.getQualification(),
                        jobApplication.getResumeLink(),
                        jobApplication.getStatus()
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(jobApplicationDTOs, HttpStatus.OK);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplicationDTO>> getJobApplicationsByJobId(@PathVariable String jobId) {
        List<JobApplicationDTO> jobApplicationDTOs = jobApplicationService.findJobApplicationsByJobId(jobId).stream()
                .map(jobApplication -> new JobApplicationDTO(
                        jobApplication.getId(),
                        jobApplication.getCandidateId(),
                        jobApplication.getJobId(),
                        jobApplication.getQualification(),
                        jobApplication.getResumeLink(),
                        jobApplication.getStatus()
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(jobApplicationDTOs, HttpStatus.OK);
    }
    @GetMapping
    public ResponseEntity<List<JobApplicationDTO>> findAllJobApplications() {
        List<JobApplicationDTO> dtos = jobApplicationService.findAllJobApplications()
                .stream()
                .map(app -> new JobApplicationDTO(
                        app.getId(),
                        app.getCandidateId(),
                        app.getJobId(),
                        app.getQualification(),
                        app.getResumeLink(),
                        app.getStatus()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobApplicationDTO>> getJobApplicationsByStatus(@PathVariable String status) {
        List<JobApplicationDTO> jobApplicationDTOs = jobApplicationService.findJobApplicationsByStatus(status).stream()
                .map(jobApplication -> new JobApplicationDTO(
                        jobApplication.getId(),
                        jobApplication.getCandidateId(),
                        jobApplication.getJobId(),
                        jobApplication.getQualification(),
                        jobApplication.getResumeLink(),
                        jobApplication.getStatus()
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(jobApplicationDTOs, HttpStatus.OK);
    }
}