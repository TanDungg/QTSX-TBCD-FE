import React, { useEffect, useState } from "react";
import { Button, Card, Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
import Helpers from "src/helpers";

function ChuKy({ permission }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [HinhAnh, setHinhAnh] = useState();
  const [ImageUrl, setImageUrl] = useState(null);
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

  const beforeUpload = (file) => {
    const isHinhAnh = file.type === "image/jpeg" || file.type === "image/png";
    if (!isHinhAnh) {
      message.error("Vui lòng tải file ảnh!");
    } else {
      const reader = new FileReader();
      setDisable(false);
      setHinhAnh(file);
      reader.onload = (e) => setImageUrl(e.target.result);
      reader.readAsDataURL(file);
    }
    return false;
  };

  const uploadFile = () => {
    if (HinhAnh) {
      const formData = new FormData();
      formData.append("file", HinhAnh);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          handleLuuChuKySo(data.path);
        })
        .catch(() => {
          message.error("Tải hình ảnh không thành công.");
        });
    } else {
      Helpers.alertError("Vui lòng tải file hình ảnh chữ ký số!");
    }
  };

  const handleLuuChuKySo = (path) => {
    const params = convertObjectToUrlParams({
      HinhAnhChuKySo: path,
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
        getData();
        setDisable(true);
      }
    });
  };

  const propluu = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận lưu chữ ký số",
    onOk: uploadFile,
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

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload chữ ký số
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
          accept="image/*"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          style={{ width: "250px", height: "250px" }}
        >
          {ImageUrl ? (
            <img
              style={{ maxWidth: "100%", maxHeight: "100%" }}
              src={ImageUrl}
              alt="Chữ ký số"
            />
          ) : (
            uploadButton
          )}
        </Upload>
        <div
          style={{
            display: "flex",
            width: "250px",
            justifyContent: "space-around",
          }}
        >
          <Button
            className="th-margin-bottom-0 btn-margin-bottom-0"
            type="primary"
            onClick={modalLuuChuKySo}
            disabled={disable}
          >
            Lưu chữ ký
          </Button>
          <Button
            className="th-margin-bottom-0 btn-margin-bottom-0"
            type="danger"
            onClick={modalXoaChuKySo}
            disabled={!ImageUrl}
          >
            Xóa chữ ký
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ChuKy;
