package com.credx.campus.domain.posting;

import com.credx.campus.common.PageResponse;
import com.credx.campus.domain.user.User;
import com.credx.campus.security.AuthHelper;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/company/postings")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyPostingController {

    private final PostingService postingService;
    private final AuthHelper authHelper;

    public CompanyPostingController(PostingService postingService, AuthHelper authHelper) {
        this.postingService = postingService;
        this.authHelper = authHelper;
    }

    @PostMapping
    public PostingResponse create(@Valid @RequestBody CreatePostingRequest request) {
        return postingService.create(authHelper.currentUser(), request);
    }

    @GetMapping
    public PageResponse<PostingResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return postingService.listCompanyPostings(authHelper.currentUser().getId(), page, size);
    }

    @PostMapping("/{id}/close")
    public PostingResponse close(@PathVariable Long id) {
        return postingService.closeByCompany(authHelper.currentUser().getId(), id);
    }
}
