package com.jobsearchportal.service;

import com.jobsearchportal.entity.Candidate;
import com.jobsearchportal.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private Validator validator;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public Candidate createCandidate(Candidate candidate) {
        // Validate entity
        Set<ConstraintViolation<Candidate>> violations = validator.validate(candidate);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Check for duplicate email
        if (candidateRepository.findByEmail(candidate.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Hash password
        candidate.setPassword(passwordEncoder.encode(candidate.getPassword()));

        // Set audit fields
        candidate.onCreate();

        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidate(String id, Candidate updatedCandidate) {
        // Validate entity
        Set<ConstraintViolation<Candidate>> violations = validator.validate(updatedCandidate);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Find existing candidate
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found with id: " + id));

        // Check for email conflict
        if (!candidate.getEmail().equals(updatedCandidate.getEmail()) &&
                candidateRepository.findByEmail(updatedCandidate.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Update fields
        candidate.setName(updatedCandidate.getName());
        candidate.setEmail(updatedCandidate.getEmail());
        if (updatedCandidate.getPassword() != null && !updatedCandidate.getPassword().isEmpty()) {
            candidate.setPassword(passwordEncoder.encode(updatedCandidate.getPassword()));
        }
        candidate.setPhone(updatedCandidate.getPhone());
        candidate.setResumeLink(updatedCandidate.getResumeLink());
        candidate.setSkills(updatedCandidate.getSkills());
        candidate.onUpdate();

        return candidateRepository.save(candidate);
    }

    public void deleteCandidate(String id) {
        if (!candidateRepository.existsById(id)) {
            throw new IllegalArgumentException("Candidate not found with id: " + id);
        }
        candidateRepository.deleteById(id);
    }

    public Candidate findCandidateById(String id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found with id: " + id));
    }

    public Optional<Candidate> findCandidateByEmail(String email) {
        return candidateRepository.findByEmail(email);
    }
    public List<Candidate> findAllCandidates() {
        return candidateRepository.findAll();
    }

    public List<Candidate> findCandidatesBySkill(String skill) {
        return candidateRepository.findBySkillsContaining(skill);
    }
}