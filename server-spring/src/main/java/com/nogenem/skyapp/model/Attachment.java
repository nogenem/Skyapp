package com.nogenem.skyapp.model;

import lombok.Data;

@Data
public class Attachment {

  private String originalName;

  private int size;

  private String path;

  private String mimeType;

  private ImageDimensions imageDimensions;

  @Data
  private class ImageDimensions {

    private int width;
    private int height;

  }

}
