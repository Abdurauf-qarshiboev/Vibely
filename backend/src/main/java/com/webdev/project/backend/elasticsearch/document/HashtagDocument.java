package com.webdev.project.backend.elasticsearch.document;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Setter
@Getter
@Document(indexName = "hashtags")
public class HashtagDocument {

    @Id
    private Long id;

    @Field(type = FieldType.Text, name = "name")
    private String name;

    public HashtagDocument() {}

    // Constructor to convert from JPA entity
    public HashtagDocument(com.webdev.project.backend.entities.Hashtag hashtag) {
        this.id = hashtag.getId();
        this.name = hashtag.getName();
    }
}