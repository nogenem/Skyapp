package com.nogenem.skyapp.validator;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.nogenem.skyapp.annotation.PasswordMatch;
import com.nogenem.skyapp.interfaces.IHasPasswordAndConfirmation;

public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, IHasPasswordAndConfirmation> {

  @Override
  public boolean isValid(IHasPasswordAndConfirmation value, ConstraintValidatorContext context) {
    return value.getPassword().equals(value.getPasswordConfirmation());
  }

}
