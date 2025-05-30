package com.jobsearchportal.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Document(collection = "job_applications")
public class JobApplication {

    @Id
    private String id; // MongoDB ObjectId as String

    @NotBlank(message = "Candidate ID is required")
    private String candidateId; // Reference to Candidate document

    @NotBlank(message = "Job ID is required")
    private String jobId; // Reference to Job document

    @NotBlank(message = "Qualification is required")
    @Size(max = 255, message = "Qualification must be less than 255 characters")
    private String qualification;

    @NotBlank(message = "Resume link is required")
    @Size(max = 255, message = "Resume link must be less than 255 characters")
    private String resumeLink;

    @NotBlank(message = "Status is required")
    @Size(max = 50, message = "Status must be less than 50 characters")
    private String status;

    private LocalDateTime applicationDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Constructors
    public JobApplication() {
    }

    public JobApplication(String candidateId, String jobId, String qualification, String resumeLink, String status) {
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

    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Lifecycle-like behavior for audit fields
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.applicationDate = LocalDateTime.now();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}