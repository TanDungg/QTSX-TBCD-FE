import {
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Card,
  Input,
  Col,
  Upload,
  Button,
  Row,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL_API } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import Helpers from "src/helpers";
import { fetchStart } from "src/appRedux/actions";

const FormItem = Form.Item;
const { TextArea } = Input;

function ModalEditPhanHoi({ openModalFS, openModal, phanhoi, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [DisableUploadHinhAnh, setDisableUploadHinhAnh] = useState(false);

  useEffect(() => {
    if (openModal) {
      if (phanhoi) {
        setFieldsValue({
          modaleditphanhoi: phanhoi,
        });
        if (phanhoi.hinhAnh) {
          setFileHinhAnh(phanhoi && phanhoi.hinhAnh);
          setDisableUploadHinhAnh(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const propshinhanh = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnh(file);
        setDisableUploadHinhAnh(true);
        setFieldTouch(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleViewFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const onFinish = (values) => {
    UploadFile(values.modaleditphanhoi);
  };

  const UploadFile = (modaleditphanhoi) => {
   
  };

  const saveData = (modaleditphanhoi) => {};

  const handleCancel = () => {
    resetFields();
    setFieldTouch(false);
    setDisableUploadHinhAnh(false);
    setFileHinhAnh(null);
    openModalFS(false);
  };

  return (
    <AntModal
      title="Chỉnh sửa phản hồi"
      open={openModal}
      width={width >= 1600 ? `60%` : width >= 1200 ? `75%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    ></AntModal>
  );
}

export default ModalEditPhanHoi;
