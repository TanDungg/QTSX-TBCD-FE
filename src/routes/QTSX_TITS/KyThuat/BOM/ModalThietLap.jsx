import { Modal as AntModal, Button, Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { SaveOutlined } from "@ant-design/icons";
import TreeTransfer from "src/components/Common/TreeTransfer";
import { treeToFlatlist } from "src/util/Common";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
function ModalThietLap({ openModalFS, openModal, saveThietLap, dataTL }) {
  const dispatch = useDispatch();
  const [treeData, settreeData] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };

  useEffect(() => {
    if (openModal) {
      getTreeXuongTram();
      if (dataTL.length > 0) {
        setTargetKeys(dataTL.map((k) => k.tits_qtsx_TramXuong_Id));
      }
    }
  }, [openModal]);
  const getTreeXuongTram = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BOM/get-list-xuong-tram-bom-tree?donVi_Id=${INFO.donVi_Id}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          settreeData(res.data);
        } else {
          settreeData([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const onChange = (keys, direction) => {
    if (direction === "right") {
      const newKey = keys.filter((itemB) => !targetKeys.includes(itemB));
      setTargetKeys([...targetKeys, ...newKey]);
    } else {
      const newKey = targetKeys.filter((itemB) => keys.includes(itemB));
      setTargetKeys(newKey);
    }
  };
  const handleCancel = () => {
    openModalFS(false);
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = () => {
    const data = treeToFlatlist(treeData);
    const newData = [];
    targetKeys.forEach((k, index) => {
      data.forEach((t) => {
        if (k === t.id) {
          newData.push({
            tits_qtsx_TramXuong_Id: k,
            name: t.ma,
            thuTu: index + 1,
          });
        }
      });
    });
    saveThietLap(newData);
    openModalFS(false);
  };
  const title = "Thiết lập file dữ liệu mẫu BOM";

  return (
    <AntModal
      title={title}
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content overflow-treeTransfer">
        <TreeTransfer
          dataSource={treeData}
          targetKeys={targetKeys}
          onChange={onChange}
        />
      </div>
      <Row style={{ marginTop: 20 }}>
        <Col span={24} align="center">
          <Button
            style={{ marginBottom: 0 }}
            icon={<SaveOutlined />}
            type="primary"
            disabled={targetKeys.length === 0}
            onClick={onFinish}
          >
            Lưu thiết lập
          </Button>
        </Col>
      </Row>
    </AntModal>
  );
}

export default ModalThietLap;
