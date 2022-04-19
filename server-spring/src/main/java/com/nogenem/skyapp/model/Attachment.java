package com.nogenem.skyapp.model;

import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Attachment {

  private String originalName;

  private long size;

  private String path;

  private String mimeType;

  private ImageDimensions imageDimensions;

  @Data
  public class ImageDimensions {

    private int width;
    private int height;

    public JSONObject toJSON() {
      JSONObject obj = new JSONObject();

      obj.put("width", this.getWidth());
      obj.put("height", this.getHeight());

      return obj;
    }

  }

}
