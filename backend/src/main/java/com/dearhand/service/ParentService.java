package com.dearhand.service;

import com.dearhand.dto.parent.ParentDto;
import com.dearhand.dto.parent.ParentRequest;
import com.dearhand.entity.Parent;
import com.dearhand.entity.User;
import com.dearhand.enums.Role;
import com.dearhand.repository.ParentRepository;
import com.dearhand.repository.UserRepository;
import com.dearhand.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ParentDto> listParents(UserPrincipal principal) {
        return parentRepository.findByFamilyUserId(principal.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ParentDto createParent(UserPrincipal principal, ParentRequest request) {
        User familyUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Family user not found"));

        Parent parent = Parent.builder()
                .familyUser(familyUser)
                .name(request.getName().trim())
                .age(request.getAge())
                .address(request.getAddress().trim())
                .city(request.getCity() != null ? request.getCity().trim() : "Mysuru")
                .language(request.getLanguage() != null ? request.getLanguage().trim() : "Kannada")
                .careNotes(request.getCareNotes())
                .emergencyContactName(request.getEmergencyContactName().trim())
                .emergencyContactPhone(request.getEmergencyContactPhone().trim())
                .build();

        Parent saved = parentRepository.save(parent);
        return mapToDto(saved);
    }

    @Transactional
    public ParentDto updateParent(UserPrincipal principal, Long parentId, ParentRequest request) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent profile not found with ID: " + parentId));

        // Ownership check
        if (!parent.getFamilyUser().getId().equals(principal.getId()) && principal.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You do not have permission to modify this parent profile");
        }

        parent.setName(request.getName().trim());
        parent.setAge(request.getAge());
        parent.setAddress(request.getAddress().trim());
        if (request.getCity() != null) parent.setCity(request.getCity().trim());
        if (request.getLanguage() != null) parent.setLanguage(request.getLanguage().trim());
        parent.setCareNotes(request.getCareNotes());
        parent.setEmergencyContactName(request.getEmergencyContactName().trim());
        parent.setEmergencyContactPhone(request.getEmergencyContactPhone().trim());

        Parent saved = parentRepository.save(parent);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public ParentDto getParentById(UserPrincipal principal, Long parentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent profile not found with ID: " + parentId));

        if (!parent.getFamilyUser().getId().equals(principal.getId()) && principal.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You do not have permission to access this parent profile");
        }

        return mapToDto(parent);
    }

    public ParentDto mapToDto(Parent parent) {
        return ParentDto.builder()
                .id(parent.getId())
                .familyUserId(parent.getFamilyUser().getId())
                .name(parent.getName())
                .age(parent.getAge())
                .address(parent.getAddress())
                .city(parent.getCity())
                .language(parent.getLanguage())
                .careNotes(parent.getCareNotes())
                .emergencyContactName(parent.getEmergencyContactName())
                .emergencyContactPhone(parent.getEmergencyContactPhone())
                .createdAt(parent.getCreatedAt())
                .build();
    }
}
