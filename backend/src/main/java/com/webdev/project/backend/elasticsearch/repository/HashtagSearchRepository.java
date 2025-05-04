package com.webdev.project.backend.elasticsearch.repository;

import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.webdev.project.backend.elasticsearch.document.HashtagDocument;

@Repository("hashtagSearchRepository")
public interface HashtagSearchRepository extends ElasticsearchRepository<HashtagDocument, Long> {

    List<HashtagDocument> findByNameContainingIgnoreCase(String nameQuery);

    @Query(
            "{\"match\": {\"name\": {\"query\": \"?0\", \"fuzziness\": \"AUTO\"}}}"
    )
    List<HashtagDocument> searchByName(String query);
}