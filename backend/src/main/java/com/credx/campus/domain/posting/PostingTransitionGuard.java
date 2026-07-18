package com.credx.campus.domain.posting;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class PostingTransitionGuard {

    public void assertTransition(PostingStatus from, PostingStatus to) {
        boolean allowed = switch (from) {
            case DRAFT -> to == PostingStatus.PENDING_REVIEW;
            case PENDING_REVIEW -> to == PostingStatus.APPROVED
                || to == PostingStatus.REJECTED
                || to == PostingStatus.NEEDS_REVISION;
            case NEEDS_REVISION -> to == PostingStatus.PENDING_REVIEW;
            case APPROVED -> to == PostingStatus.CLOSED;
            case REJECTED, CLOSED -> false;
        };
        if (!allowed) {
            throw new ApiException(HttpStatus.CONFLICT.value(),
                "Invalid transition from " + from + " to " + to);
        }
    }

    public void assertEditable(PostingStatus status) {
        if (status != PostingStatus.DRAFT && status != PostingStatus.NEEDS_REVISION) {
            throw new ApiException(HttpStatus.CONFLICT.value(),
                "Posting can only be edited in DRAFT or NEEDS_REVISION status");
        }
    }
}
