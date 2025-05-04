package com.webdev.project.backend.controllers;

import com.webdev.project.backend.services.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    @Autowired
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            Path filePath = imageService.getImagePath(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {

                // Detect the type of image
                MediaType mediaType;
                if (fileName.endsWith(".png")){
                    mediaType = MediaType.IMAGE_JPEG;
                } else if (fileName.endsWith(".jpg")){
                    mediaType = MediaType.IMAGE_JPEG;
                } else {
                    System.out.println("Not a valid image file");
                    mediaType = MediaType.IMAGE_JPEG; // Educated guess
                }

                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}