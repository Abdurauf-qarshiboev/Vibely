package com.webdev.project.backend.elasticsearch.repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.webdev.project.backend.elasticsearch.document.UserDocument;

@Repository("userSearchRepository")
public interface UserSearchRepository extends ElasticsearchRepository<UserDocument, Long> {

    List<UserDocument> findByFirstNameContainingOrLastNameContainingOrUsernameContainingIgnoreCase(
            String firstNameQuery, String lastNameQuery, String usernameQuery);

    @org.springframework.data.elasticsearch.annotations.Query(
            "{\"multi_match\": {\"query\": \"?0\", \"fields\": [\"firstName\", \"lastName\", \"username\"], \"fuzziness\": \"AUTO\"}}"
    )
    List<UserDocument> searchByNamesOrUsername(String query);
}