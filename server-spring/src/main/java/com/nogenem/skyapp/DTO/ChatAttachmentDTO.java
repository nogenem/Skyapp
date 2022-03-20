package com.nogenem.skyapp.DTO;

import com.nogenem.skyapp.model.Attachment;
import com.nogenem.skyapp.model.Attachment.ImageDimensions;

import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatAttachmentDTO {

  private String originalName;
  private long size;
  private String path;
  private String mimeType;
  private ImageDimensions imageDimensions;

  public ChatAttachmentDTO(Attachment attachment) {
    this.originalName = attachment.getOriginalName();
    this.size = attachment.getSize();
    this.path = attachment.getPath();
    this.mimeType = attachment.getMimeType();
    this.imageDimensions = attachment.getImageDimensions();
  }

  public JSONObject toJSON() {
    JSONObject obj = new JSONObject();

    obj.put("originalName", this.getOriginalName());
    obj.put("size", this.getSize());
    obj.put("path", this.getPath());
    obj.put("mimeType", this.getMimeType());

    if (this.getImageDimensions() != null) {
      obj.put("imageDimensions", this.getImageDimensions().toJSON());
    } else {
      obj.put("imageDimensions", JSONObject.NULL);
    }

    return obj;
  }

}
