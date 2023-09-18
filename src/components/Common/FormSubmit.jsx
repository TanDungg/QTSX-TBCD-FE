import React from "react";
import { Row, Col, Button, Divider } from "antd";
import { RollbackOutlined, SaveOutlined } from "@ant-design/icons";

const FormSubmit = ({
  goBack,
  saveAndClose,
  disabled,
  handleSave,
  loading,
  content,
}) => {
  return (
    <>
      <Divider />
      <Row style={{ marginTop: 20 }}>
        <Col style={{ marginBottom: 8, textAlign: "center" }} span={24}>
          {goBack && (
            <Button
              className="th-btn-margin-bottom-0"
              icon={<RollbackOutlined />}
              onClick={goBack}
              style={{ marginTop: 10 }}
            >
              Quay lại
            </Button>
          )}
          {handleSave ? (
            <Button
              disabled={!disabled}
              className="th-btn-margin-bottom-0"
              type="primary"
              onClick={() => saveAndClose(false)}
              icon={<SaveOutlined />}
              loading={loading}
              style={{ marginTop: 10 }}
            >
              {content && content.length > 0 ? content : "Lưu"}
            </Button>
          ) : (
            <Button
              disabled={!disabled}
              className="th-btn-margin-bottom-0"
              type="primary"
              htmlType={"submit"}
              icon={<SaveOutlined />}
              loading={loading}
              style={{ marginTop: 10 }}
            >
              {content && content.length > 0 ? content : "Lưu"}
            </Button>
          )}
          {saveAndClose && (
            <Button
              disabled={!disabled}
              className="th-btn-margin-bottom-0"
              icon={<SaveOutlined />}
              style={{ marginTop: 10 }}
              onClick={() => saveAndClose(true)}
            >
              {content && content.length > 0
                ? content + " và thoát"
                : "Lưu và thoát"}
            </Button>
          )}
        </Col>
      </Row>
    </>
  );
};

FormSubmit.defaultProps = {
  loading: false,
};

export default FormSubmit;
