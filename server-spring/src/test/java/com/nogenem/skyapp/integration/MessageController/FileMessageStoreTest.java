package com.nogenem.skyapp.integration.MessageController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.nogenem.skyapp.BaseSpringTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.ChannelRepository;
import com.nogenem.skyapp.repository.MessageRepository;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.service.FilesStorageService;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.ResultActions;

public class FileMessageStoreTest extends BaseSpringTest {

  @MockBean
  private SocketIoService socketIoService;

  @MockBean
  private FilesStorageService filesStorageService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Autowired
  private MessageRepository messageRepo;

  @Test
  @DisplayName("should be able to send a file message")
  public void shouldBeAbleToSendFileMessage() throws Exception {
    MockMultipartFile file1 = new MockMultipartFile("files", "test1.txt", "text/plain", "TEST1".getBytes());
    MockMultipartFile file2 = new MockMultipartFile("files", "test2.txt", "text/plain", "TEST2".getBytes());

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    when(this.filesStorageService.save(any())).thenReturn(FilesStorageService.ROOT);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(multipart("/api/channel/{channelId}/files", channel.getId())
      .file(file1)
      .file(file2));

    resultActions.andExpect(status().isCreated())
      .andExpect(jsonPath("$.messagesObjs").isNotEmpty());

    List<Message> savedMessages = this.messageRepo.findByChannelId(channel.getId());
    assertThat(savedMessages).hasSize(2);
  }

  @Test
  @DisplayName("should not be able to send a file message with an invalid channelId")
  public void shouldNotBeAbleToSendFileMessageWithInvalidChannelId() throws Exception {
    String channelId = "some-channel-id";
    MockMultipartFile file1 = new MockMultipartFile("files", "test1.txt", "text/plain", "TEST1".getBytes());
    MockMultipartFile file2 = new MockMultipartFile("files", "test2.txt", "text/plain", "TEST2".getBytes());

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    when(this.filesStorageService.save(any())).thenReturn(FilesStorageService.ROOT);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(multipart("/api/channel/{channelId}/files", channelId)
      .file(file1)
      .file(file2));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to send a file message to a channel that you are not a member of")
  public void shouldNotBeAbleToSendFileMessageToChannelYouAreNotMemberOf() throws Exception {
    MockMultipartFile file1 = new MockMultipartFile("files", "test1.txt", "text/plain", "TEST1".getBytes());
    MockMultipartFile file2 = new MockMultipartFile("files", "test2.txt", "text/plain", "TEST2".getBytes());

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    Channel channel = ModelFactory.getTestChannel(List.of(otherUser1, otherUser2));
    this.channelRepo.save(channel);

    when(this.filesStorageService.save(any())).thenReturn(FilesStorageService.ROOT);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(multipart("/api/channel/{channelId}/files", channel.getId())
      .file(file1)
      .file(file2));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
