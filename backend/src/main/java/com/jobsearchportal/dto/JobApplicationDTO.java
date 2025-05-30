package com.jobsearchportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class JobApplicationDTO {

    private String id;

    @NotBlank(message = "Candidate ID is required")
    private String candidateId;

    @NotBlank(message = "Job ID is required")
    private String jobId;

    @NotBlank(message = "Qualification is required")
    @Size(max = 255, message = "Qualification must be less than 255 characters")
    private String qualification;

    @NotBlank(message = "Resume link is required")
    @Size(max = 255, message = "Resume link must be less than 255 characters")
    private String resumeLink;

    @NotBlank(message = "Status is required")
    @Size(max = 50, message = "Status must be less than 50 characters")
    private String status;

    // Constructors
    public JobApplicationDTO() {
    }

    public JobApplicationDTO(String id, String candidateId, String jobId, String qualification, String resumeLink, String status) {
        this.id = id;
        this.candidateId = candidateId;
        this.jobId = jobId;
        this.qualification = qualification;
        this.resumeLink = resumeLink;
        this.status = status;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getResumeLink() {
        return resumeLink;
    }

    public void setResumeLink(String resumeLink) {
        this.resumeLink = resumeLink;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}