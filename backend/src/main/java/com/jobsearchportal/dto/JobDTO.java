package com.jobsearchportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

public class JobDTO {

    private String id;

    @NotBlank(message = "Position is required")
    @Size(max = 100, message = "Position must be less than 100 characters")
    private String position;

    @NotBlank(message = "Company ID is required")
    private String companyId;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location must be less than 255 characters")
    private String location;

    @NotBlank(message = "Experience is required")
    @Size(max = 50, message = "Experience must be less than 50 characters")
    private String experience;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;

    @NotEmpty(message = "Skills cannot be empty")
    private List<String> skills = new ArrayList<>();

    @NotBlank(message = "Job type is required")
    @Size(max = 50, message = "Job type must be less than 50 characters")
    private String jobType;

    // Constructors
    public JobDTO() {
    }

    public JobDTO(String id, String position, String companyId, String location, String experience, String description, List<String> skills, String jobType) {
        this.id = id;
        this.position = position;
        this.companyId = companyId;
        this.location = location;
        this.experience = experience;
        this.description = description;
        this.skills = skills;
        this.jobType = jobType;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }
}