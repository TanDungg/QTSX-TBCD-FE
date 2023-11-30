import React from "react";
import PropTypes from "prop-types";
import { InfoCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useSelector } from "react-redux";

const ContainerHeader = ({ title, description, buttons, back, classCss }) => {
  const { themeColor } = useSelector(({ settings }) => settings);
  const { width } = useSelector(({ common }) => common).toJS();
  const renderTitle = description ? (
    <div style={{ display: "flex" }}>
      {back && (
        <ArrowLeftOutlined
          onClick={back}
          style={{ marginTop: 5, fontSize: 16, marginRight: 10 }}
        />
      )}
      <h2 className="gx-page-title" style={{ marginRight: 10 }}>
        {title}
      </h2>
      {width > 475 ? (
        <Tooltip title={description} color={themeColor} placement="bottomLeft">
          <InfoCircleOutlined />
        </Tooltip>
      ) : (
        ""
      )}
    </div>
  ) : (
    <div style={{ display: "flex" }}>
      {back && (
        <ArrowLeftOutlined
          onClick={back}
          style={{ marginTop: 5, fontSize: 16, marginRight: 10 }}
        />
      )}
      <h2 className="gx-page-title">{title}</h2>
    </div>
  );

  return (
    <div
      className="gx-page-heading"
      style={{ marginBottom: width > 475 ? 10 : 0 }}
    >
      <div
        className={`${classCss}-display`}
        style={{
          display: width < 475 ? "block" : "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {renderTitle}
        {buttons && (
          <div
            className={classCss}
            style={{
              display: "inline-block",
              position: width < 576 ? "none" : "absolute",
              bottom: 0,
              right: 0,
              marginTop: width < 475 ? 10 : 0,
            }}
          >
            {buttons}
          </div>
        )}
      </div>
    </div>
  );
};

ContainerHeader.defaultProps = {
  title: "",
  description: "",
  classCss: "",
};

ContainerHeader.propTypes = {
  // title: PropTypes.oneOf(['string', 'element']),
  description: PropTypes.string,
  classCss: PropTypes.string,
  buttons: PropTypes.element,
  back: PropTypes.func,
};

export default ContainerHeader;
