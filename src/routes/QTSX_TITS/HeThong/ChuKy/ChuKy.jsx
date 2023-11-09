import React, { useEffect, useState } from "react";
import { Card, Upload, Row, Col, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { BASE_URL_API } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
function ChuKy({ match, history, permission }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const [Path, setPath] = useState([]);
  const [disable, setDisable] = useState(true);
  useEffect(() => {
    if (permission && permission) {
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
          setPath(res.data.hinhAnhChuKySo);
          setFileList([
            {
              url: BASE_URL_API + res.data.hinhAnhChuKySo,
              uid: "-1",
              name: res.data.hinhAnhChuKySo.split("_")[1],
              status: "done",
            },
          ]);
        }
      }
    });
  };
  const handleCancel = () => setPreviewOpen(false);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };
  const handleChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 0 && newFileList[0].status === "done") {
      setPath(newFileList[0].response.path ? newFileList[0].response.path : "");
      setDisable(false);
    } else {
      setPath("");
      setDisable(false);
    }
    setFileList(newFileList);
  };
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );
  const saveData = () => {
    const params = convertObjectToUrlParams({
      HinhAnhChuKySo: Path,
      id: INFO.user_Id,
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
      if (res && res.data) {
        setDisable(true);
        getData();
      }
    });
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title="Chữ ký" description="Chữ ký" />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ paddingBottom: 8 }}>
          <Col
            xxl={10}
            xl={10}
            lg={20}
            md={20}
            sm={19}
            xs={18}
            style={{ marginBottom: 8 }}
          >
            <h5>Chữ ký</h5>
            <Upload
              accept="image/png, image/jpeg"
              action={`${BASE_URL_API}/api/Upload`}
              headers={{
                Authorization: "Bearer ".concat(INFO.token),
              }}
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              className="upload-chu-ky"
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={handleCancel}
            >
              <img
                alt="example"
                style={{
                  width: "100%",
                }}
                src={previewImage}
              />
            </Modal>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Button type="primary" onClick={saveData} disabled={disable}>
              Lưu
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default ChuKy;
