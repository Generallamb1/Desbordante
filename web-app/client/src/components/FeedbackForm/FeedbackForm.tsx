import React, { useContext } from "react";
import { Formik, FormikHelpers } from "formik";
import { Form, Button } from "react-bootstrap";
import { validate as emailValidator } from "email-validator";
import { useMutation } from "@apollo/client";

import { AuthContext } from "../AuthContext";
import StarRatingPicker from "./StarRatingPicker";
import { CREATE_FEEDBACK } from "../../graphql/operations/mutations/createFeedback";
import {
  createFeedback,
  createFeedbackVariables,
} from "../../graphql/operations/mutations/__generated__/createFeedback";
import { ErrorContext } from "../ErrorContext";

const maxCharactersInFeedback = 2500;

interface Props {
  onSuccess: () => void;
}

const FeedbackForm: React.FC<Props> = ({ onSuccess }) => {
  const { user } = useContext(AuthContext)!;
  const { showError } = useContext(ErrorContext)!;
  const initialValues = {
    fullName: user?.name || "",
    email: user?.email || "",
    rating: 4,
    feedback: "",
  };
  const validate = (values: typeof initialValues) => {
    const errors: any = {};
    if (!values.fullName) {
      errors.fullName = "Required";
    }
    if (!values.email) {
      errors.email = "Required";
    } else if (!emailValidator(values.email)) {
      errors.email = "Incorrect email";
    }
    if (!values.feedback) {
      errors.feedback = "Required";
    }

    return errors;
  };

  const [createFeedback] = useMutation<createFeedback, createFeedbackVariables>(
    CREATE_FEEDBACK
  );

  const submitFeedback = async (values: typeof initialValues) => {
    try {
      const response = await createFeedback({
        variables: {
          rating: values.rating,
          text: values.feedback,
        },
      });
      if (response.data?.createFeedback.feedbackID) {
        onSuccess();
      }
    } catch (error: any) {
      showError({ message: error.message });
    }
  };

  return (
    <>
      <h1 className="text-center fw-bold mb-4">Send Feedback</h1>
      <Formik
        initialValues={initialValues}
        validate={validate}
        /* eslint-disable-next-line no-console */
        onSubmit={submitFeedback}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setValues,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                placeholder="John Doe"
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                disabled={!!user?.id}
                onBlur={handleBlur}
                isInvalid={touched.fullName && !!errors.fullName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fullName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                placeholder="your.email@example.com"
                name="email"
                value={values.email}
                onChange={handleChange}
                disabled={!!user?.id}
                onBlur={handleBlur}
                isInvalid={touched.email && !!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <StarRatingPicker
                max={5}
                rating={values.rating}
                onChange={(rating) => setValues({ ...values, rating })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Feedback message</Form.Label>
              <Form.Control
                placeholder="Type your feedback here"
                as="textarea"
                name="feedback"
                maxLength={maxCharactersInFeedback}
                value={values.feedback}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.feedback && !!errors.feedback}
              />
              <Form.Control.Feedback type="invalid">
                {errors.feedback}
              </Form.Control.Feedback>
              <Form.Text className="text-dull">
                {maxCharactersInFeedback - values.feedback.length} characters
                remaining
              </Form.Text>
            </Form.Group>

            <Button
              variant="outline-primary"
              type="submit"
              className="mt-2 w-100"
              disabled={isSubmitting}
            >
              Send Feedback
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default FeedbackForm;
