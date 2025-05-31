package com.jobsearchportal.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobsearchportal.dto.JobApplicationDTO;
import com.jobsearchportal.entity.JobApplication;
import com.jobsearchportal.service.CandidateService;
import com.jobsearchportal.service.CompanyService;
import com.jobsearchportal.service.JobApplicationService;
import com.jobsearchportal.service.JobService;
import com.jobsearchportal.service.MailSenderService;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @Autowired
    private MailSenderService mailSenderService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private JobService jobService;

    @Autowired
    private CandidateService candidateService;

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
        //Send email notification to the company on appliedAdd commentMore actions
        String jobId = savedJobApplication.getJobId();
        String candidateId = savedJobApplication.getCandidateId();
        String candidateName = candidateService.findCandidateById(candidateId).getName();
        String companyId = jobService.findJobById(jobId).getCompanyId();
        String companyName = companyService.findCompanyById(companyId).getName();
        String companyEmail = companyService.findCompanyById(companyId).getEmail();
        String subject = "New Job Application Received";
        String body = "A new application from " + candidateName
                + " has been received for the position at " + companyName
                + " (Job ID: " + jobId + ").";
        // Send email notification to the company if status is "applied"
        if ("applied".equalsIgnoreCase(savedJobApplication.getStatus())) {
            body += " Please review the application at your earliest convenience.";
            mailSenderService.sendNewMail(companyEmail, subject, body);
        }
        return new ResponseEntity<>(savedDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateJobStatus(@PathVariable String id, @RequestParam String status) {

        JobApplication updatedJobApplication = jobApplicationService.updateJobStatus(id, status);

        //Fetch jobId by idAdd commentMore actions
        String jobId = updatedJobApplication.getJobId();
        //Fetch candidateId by id
        String candidateId = updatedJobApplication.getCandidateId();
        //Fetch candidate name by candidateId
        String candidateName = candidateService.findCandidateById(candidateId).getName();
        //Fetch candidate email by candidateId
        String candidateEmail = candidateService.findCandidateById(candidateId).getEmail();
        //Fetch companyId by jobId
        String companyId = jobService.findJobById(jobId).getCompanyId();
        //Fetch company name by companyId
        String companyName = companyService.findCompanyById(companyId).getName();
        //Fetch company email by companyId
        String companyEmail = companyService.findCompanyById(companyId).getEmail();

        String subject;
        String body;
        String recipientEmail;

        switch (status.toLowerCase()) {

            case "accepted":
                subject = "Job Application Offer Notification";
                body = "The job application by " + candidateName + " has been accepted.";
                recipientEmail = companyEmail;
                break;
            case "withdrawn":
                subject = "Job Application Withdrawn";
                body = "The job application by " + candidateName
                        + " has been withdrawn for the position at " + companyName
                        + " (Job ID: " + jobId + "). We will contact you soon for the next steps.";
                recipientEmail = companyEmail;
                break;
            case "rejected":
                subject = "Job Application Status Update";
                body = "Dear Applicant, your job application for " + companyName
                        + " (Job ID: " + jobId + ") has been rejected. We wish you the best in your future endeavors. Thank you for your patience.";
                recipientEmail = candidateEmail;
                break;
            case "interviewing":
                subject = "Job Application Status Update";
                body = "Dear Applicant, your job application for " + companyName
                        + " (Job ID: " + jobId + ") is now in the interviewing stage. We appreciate your interest in the position. Thank you for your patience.";
                recipientEmail = candidateEmail;
                break;
            default:
                subject = "Job Application Status Update";
                body = "Dear Applicant, your job application status for " + companyName
                        + " (Job ID: " + jobId + ") has been updated to: " + status + ". Thank you for your patience.";
                recipientEmail = candidateEmail;
                break;
        }

        mailSenderService.sendNewMail(recipientEmail, subject, body);

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
