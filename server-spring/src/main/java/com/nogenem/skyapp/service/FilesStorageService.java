package com.nogenem.skyapp.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.stream.Stream;

import com.github.slugify.Slugify;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FilesStorageService {
  // https://www.bezkoder.com/spring-boot-file-upload/
  public static final Path ROOT = Paths.get("uploads");

  public void init() {
    try {
      if (!Files.exists(ROOT)) {
        Files.createDirectory(ROOT);
      }
    } catch (IOException e) {
      throw new RuntimeException("Could not initialize folder for upload!");
    }
  }

  public Path save(MultipartFile file) {
    try {
      String filename = file.getOriginalFilename();
      Long prefix = Instant.now().toEpochMilli() + Double.valueOf(Math.random() * 1_000_000_000).longValue();

      Slugify slg = new Slugify();
      filename = slg.slugify(prefix + "-" + filename);
      // add the extension point back... ;/
      filename = filename.replaceAll("(.*)-([^-]+)$", "$1.$2");

      filename = StringUtils.cleanPath(filename);

      Path path = ROOT.resolve(filename);
      Files.copy(file.getInputStream(), path);

      return path;
    } catch (Exception e) {
      throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
    }
  }

  public Resource load(String filename) {
    try {
      Path file = ROOT.resolve(filename);
      Resource resource = new UrlResource(file.toUri());
      if (resource.exists() || resource.isReadable()) {
        return resource;
      } else {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND);
      }
    } catch (MalformedURLException e) {
      throw new RuntimeException("Error: " + e.getMessage());
    }
  }

  public void deleteAll() {
    FileSystemUtils.deleteRecursively(ROOT.toFile());
  }

  public Stream<Path> loadAll() {
    try {
      return Files.walk(ROOT, 1)
          .filter(path -> !path.equals(ROOT))
          .map(ROOT::relativize);
    } catch (IOException e) {
      throw new RuntimeException("Could not load the files!");
    }
  }

}
