package com.nogenem.skyapp.controller;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;

import com.nogenem.skyapp.exception.ApiException;
import com.nogenem.skyapp.exception.InternalServerException;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import lombok.AllArgsConstructor;

@org.springframework.web.bind.annotation.ControllerAdvice
@AllArgsConstructor
public class ControllerAdvice {

  @ExceptionHandler({ ConstraintViolationException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody
  ApiException onConstraintViolationException(ConstraintViolationException e) {
    ApiException exception = new ApiException();

    for (final ConstraintViolation<?> violation : e.getConstraintViolations()) {
      exception.put(violation.getPropertyPath().toString(), violation.getMessage());
    }

    return exception;
  }

  @ExceptionHandler({ MethodArgumentNotValidException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody()
  ApiException onMethodArgumentNotValidException(MethodArgumentNotValidException e) {
    ApiException exception = new ApiException();

    for (final FieldError fieldError : e.getBindingResult().getFieldErrors()) {
      exception.put(fieldError.getField(), fieldError.getDefaultMessage());
    }

    for (final ObjectError globalError : e.getBindingResult().getGlobalErrors()) {
      exception.put(ApiException.GLOBAL_KEY, globalError.getDefaultMessage());
    }

    return exception;
  }

  @ExceptionHandler({ ApiException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody()
  ApiException onApiException(ApiException e) {
    return e;
  }

  @ExceptionHandler({ Exception.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody
  ApiException onException(Exception e) {
    e.printStackTrace();
    return new InternalServerException();
  }

}
