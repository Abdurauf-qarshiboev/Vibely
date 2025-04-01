package com.webdev.project.backend;

import com.webdev.project.backend.authentication.repositories.UserRepository;
import com.webdev.project.backend.authentication.services.UserService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}

@RestController
class HelloWorldController {

	@GetMapping("/")
	public String hello() {
		return "Hello, World!";
	}
}