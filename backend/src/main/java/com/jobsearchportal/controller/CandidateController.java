package com.jobsearchportal.controller;

import com.jobsearchportal.dto.CandidateDTO;
import com.jobsearchportal.entity.Candidate;
import com.jobsearchportal.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @PostMapping
    public ResponseEntity<CandidateDTO> createCandidate(@RequestBody CandidateDTO candidateDTO) {
        Candidate candidate = new Candidate(
                candidateDTO.getName(),
                candidateDTO.getEmail(),
                candidateDTO.getPassword(),
                candidateDTO.getPhone(),
                candidateDTO.getResumeLink(),
                candidateDTO.getSkills()
        );
        Candidate savedCandidate = candidateService.createCandidate(candidate);
        CandidateDTO savedDTO = new CandidateDTO(
                savedCandidate.getId(),
                savedCandidate.getName(),
                savedCandidate.getEmail(),
                null, // Exclude password
                savedCandidate.getPhone(),
                savedCandidate.getResumeLink(),
                savedCandidate.getSkills()
        );
        return new ResponseEntity<>(savedDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CandidateDTO> updateCandidate(@PathVariable String id, @RequestBody CandidateDTO candidateDTO) {
        Candidate candidate = new Candidate(
                candidateDTO.getName(),
                candidateDTO.getEmail(),
                candidateDTO.getPassword(),
                candidateDTO.getPhone(),
                candidateDTO.getResumeLink(),
                candidateDTO.getSkills()
        );
        Candidate updatedCandidate = candidateService.updateCandidate(id, candidate);
        CandidateDTO updatedDTO = new CandidateDTO(
                updatedCandidate.getId(),
                updatedCandidate.getName(),
                updatedCandidate.getEmail(),
                null, // Exclude password
                updatedCandidate.getPhone(),
                updatedCandidate.getResumeLink(),
                updatedCandidate.getSkills()
        );
        return new ResponseEntity<>(updatedDTO, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable String id) {
        candidateService.deleteCandidate(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateDTO> getCandidateById(@PathVariable String id) {
        Candidate candidate = candidateService.findCandidateById(id);
        CandidateDTO candidateDTO = new CandidateDTO(
                candidate.getId(),
                candidate.getName(),
                candidate.getEmail(),
                null, // Exclude password
                candidate.getPhone(),
                candidate.getResumeLink(),
                candidate.getSkills()
        );
        return new ResponseEntity<>(candidateDTO, HttpStatus.OK);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<CandidateDTO> getCandidateByEmail(@PathVariable String email) {
        Candidate candidate = candidateService.findCandidateByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found with email: " + email));
        CandidateDTO candidateDTO = new CandidateDTO(
                candidate.getId(),
                candidate.getName(),
                candidate.getEmail(),
                null, // Exclude password
                candidate.getPhone(),
                candidate.getResumeLink(),
                candidate.getSkills()
        );
        return new ResponseEntity<>(candidateDTO, HttpStatus.OK);
    }

    @GetMapping("/search/skill/{skill}")
    public ResponseEntity<List<CandidateDTO>> searchCandidatesBySkill(@PathVariable String skill) {
        List<CandidateDTO> candidateDTOs = candidateService.findCandidatesBySkill(skill).stream()
                .map(candidate -> new CandidateDTO(
                        candidate.getId(),
                        candidate.getName(),
                        candidate.getEmail(),
                        null, // Exclude password
                        candidate.getPhone(),
                        candidate.getResumeLink(),
                        candidate.getSkills()
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(candidateDTOs, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<CandidateDTO>> findAllCandidates() {
        List<CandidateDTO> candidateDTOs = candidateService.findAllCandidates().stream()
                .map(candidate -> new CandidateDTO(
                        candidate.getId(),
                        candidate.getName(),
                        candidate.getEmail(),
                        candidate.getPassword(), // You may choose to exclude password here for security
                        candidate.getPhone(),
                        candidate.getResumeLink(),
                        candidate.getSkills()
                ))
                .collect(Collectors.toList());

        return new ResponseEntity<>(candidateDTOs, HttpStatus.OK);
    }
}