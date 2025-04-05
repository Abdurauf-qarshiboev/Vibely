package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Integer> {
    Optional<Hashtag> findByName(String name);
}
