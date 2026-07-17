package com.credx.campus.domain.posting;

import com.credx.campus.common.PageResponse;
import com.credx.campus.domain.user.User;
import com.credx.campus.security.AuthHelper;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/postings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPostingController {

    private final PostingService postingService;
    private final AuthHelper authHelper;

    public AdminPostingController(PostingService postingService, AuthHelper authHelper) {
        this.postingService = postingService;
        this.authHelper = authHelper;
    }

    @GetMapping("/pending")
    public PageResponse<PostingResponse> pending(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return postingService.listPending(page, size);
    }

    @GetMapping("/{id}")
    public PostingResponse get(@PathVariable Long id) {
        return postingService.getByIdForAdmin(id);
    }

    @PostMapping("/{id}/approve")
    public PostingResponse approve(@PathVariable Long id) {
        User admin = authHelper.currentUser();
        return postingService.approve(id, admin);
    }

    @PostMapping("/{id}/reject")
    public PostingResponse reject(@PathVariable Long id, @Valid @RequestBody RejectPostingRequest request) {
        User admin = authHelper.currentUser();
        return postingService.reject(id, admin, request.reason());
    }
}
