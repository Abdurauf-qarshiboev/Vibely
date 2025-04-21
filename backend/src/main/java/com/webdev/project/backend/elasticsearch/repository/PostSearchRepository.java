package com.webdev.project.backend.elasticsearch.repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.webdev.project.backend.elasticsearch.document.PostDocument;

@Repository("postSearchRepository")
public interface PostSearchRepository extends ElasticsearchRepository<PostDocument, Long> {

    List<PostDocument> findByTitleContainingOrBodyContainingIgnoreCase(String titleQuery, String bodyQuery);

    @org.springframework.data.elasticsearch.annotations.Query(
            "{\"multi_match\": {\"query\": \"?0\", \"fields\": [\"title^3\", \"body\"], \"fuzziness\": \"AUTO\"}}"
    )
    List<PostDocument> searchByTitleOrBody(String query);
}