import React, { useEffect, useState } from "react";
import { Button, Card, Upload, message } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { BASE_URL_API } from "src/constants/Config";
import {
  getTokenInfo,
  getLocalStorage,
  convertObjectToUrlParams,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { fetchStart } from "src/appRedux/actions";
import { useDispatch } from "react-redux";
import { Modal } from "src/components/Common";

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("Vui lòng tải file ảnh!");
  }
  return isJpgOrPng;
};

function ChuKy({ permission }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Path, setPath] = useState();
  const [loading, setLoading] = useState(false);
  const [ImageUrl, setImageUrl] = useState();
  const [disable, setDisable] = useState(true);

  useEffect(() => {
    if (permission && permission.view) {
      getData();
    }
  }, []);

  const getData = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/chu-ky-so`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        if (res.data.hinhAnhChuKySo) {
          const dataUrl = `data:image/png;base64,${res.data.hinhAnhChuKySo}`;
          setImageUrl(dataUrl);
        } else {
          setImageUrl(null);
        }
      } else {
        setImageUrl(null);
      }
    });
  };

  const handleLuuChuKySo = () => {
    const params = convertObjectToUrlParams({
      HinhAnhChuKySo: Path,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/chu-ky-so?${params}`,
          "PUT",
          null,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        setPath(null);
        setImageUrl(null);
        setDisable(true);
        getData();
      }
    });
  };

  const propluu = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận lưu chữ ký số",
    onOk: handleLuuChuKySo,
  };

  const modalLuuChuKySo = () => {
    Modal(propluu);
  };

  const handleXoaChuKySo = () => {
    const params = convertObjectToUrlParams({
      Isdelete: true,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/chu-ky-so?${params}`,
          "PUT",
          null,
          "DELETE",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      getData();
    });
  };

  const propdelete = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận xóa chữ ký số",
    onOk: handleXoaChuKySo,
  };

  const modalXoaChuKySo = () => {
    Modal(propdelete);
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      setPath(info.file.response.path);
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
        setDisable(false);
      });
    }
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  return (
    <div className="gx-main-content">
      <ContainerHeader title="Chữ ký số" description="Chữ ký số" />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        style={{ height: "75vh" }}
      >
        <Upload
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          action={`${BASE_URL_API}/api/Upload`}
          headers={{
            Authorization: "Bearer ".concat(INFO.token),
          }}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          style={{ width: "250px" }}
        >
          {ImageUrl ? <img src={ImageUrl} alt="Chữ ký số" /> : uploadButton}
        </Upload>
        <div
          style={{
            display: "flex",
            width: "250px",
            justifyContent: "space-around",
          }}
        >
          <Button type="primary" onClick={modalLuuChuKySo} disabled={disable}>
            Lưu chữ ký
          </Button>
          <Button type="danger" onClick={modalXoaChuKySo} disabled={!ImageUrl}>
            Xóa chữ ký
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ChuKy;
