import { RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { Modal as AntModal, Button, Card, Divider, Image } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { EditableTableRow, Table } from "src/components/Common";
import { BASE_URL_API } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalThemCauHoi({
  openModalFS,
  openModal,
  chuyende,
  list_cauhoi,
  DataThemCauHoi,
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [ListCauHoi, setListCauHoi] = useState([]);
  const [SelectedCauHoi, setSelectedCauHoi] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListCauHoi(chuyende);
      if (list_cauhoi.length > 0) {
        setSelectedCauHoi(list_cauhoi);
        const listKey = list_cauhoi.map((cauhoi) => {
          return cauhoi.key;
        });
        setSelectedKeys(listKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListCauHoi = (vptq_lms_ChuyenDeDaoTao_Id) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      isSuDung: true,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_CauHoi?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data.map((dt, index) => {
            return {
              ...dt,
              key: index + 1,
            };
          });
          console.log(data);
          setListCauHoi(data);
        } else {
          setListCauHoi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "noiDung",
      key: "noiDung",
      align: "left",
      width: 300,
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 150,
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "Âm thanh/Video",
      dataIndex: "video",
      key: "video",
      align: "center",
      width: 150,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 150,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const handleThemCauHoi = () => {
    DataThemCauHoi(SelectedCauHoi);
    handleCancel();
  };

  const handleCancel = () => {
    openModalFS(false);
    setSelectedCauHoi([]);
    setSelectedKeys([]);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedCauHoi,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedCauHoi = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedCauHoi(newSelectedCauHoi);
      setSelectedKeys(newSelectedKeys);
    },
  };

  return (
    <AntModal
      title="Thêm danh sách câu hỏi"
      open={openModal}
      width={width > 900 ? `70%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Table
          bordered
          columns={colValues}
          scroll={{ x: 1000, y: "50vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={ListCauHoi}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: SelectedKeys,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <Button
              icon={<RollbackOutlined />}
              onClick={() => handleCancel()}
              className="th-margin-bottom-0"
              htmlType={"submit"}
            >
              Quay lại
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleThemCauHoi()}
              className="th-margin-bottom-0"
              type="primary"
              disabled={SelectedCauHoi.length === 0}
            >
              Thêm câu hỏi
            </Button>
          </div>
        </div>
      </Card>
    </AntModal>
  );
}

export default ModalThemCauHoi;
