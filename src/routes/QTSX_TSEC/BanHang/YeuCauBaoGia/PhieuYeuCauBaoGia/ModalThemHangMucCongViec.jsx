import { RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { Modal as AntModal, Button, Card, Divider } from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalThemHangMucCongViec({
  openModalFS,
  openModal,
  ListNoiDung,
  DataThemHangMucCongViec,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [ListHangMucCongViec, setListHangMucCongViec] = useState([]);
  const [SelectedCongViec, setSelectedCongViec] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListHangMucCongViec(ListNoiDung);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListHangMucCongViec = (ListNoiDung) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_CongViec?page=-1`,
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
              tsec_qtsx_CongViec_Id: dt.id,
              key: index + 1,
            };
          });
          setListHangMucCongViec(data);

          if (ListNoiDung.length > 0) {
            const listnoidung = data.filter((dt) =>
              ListNoiDung.some(
                (noidung) =>
                  noidung.tsec_qtsx_CongViec_Id.toLowerCase() === dt.id
              )
            );
            setSelectedCongViec(listnoidung);

            const listKey = listnoidung.map((noidung) => {
              return noidung.key;
            });
            setSelectedKeys(listKey);
          }
        } else {
          setListHangMucCongViec([]);
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
      title: "Mã công việc",
      dataIndex: "maCongViec",
      key: "maCongViec",
      align: "center",
      width: 150,
    },
    {
      title: "Nội dung công việc",
      dataIndex: "noiDungCongViec",
      key: "noiDungCongViec",
      align: "left",
      width: 250,
    },
    {
      title: "Loại thông tin",
      dataIndex: "tenLoaiThongTin",
      key: "tenLoaiThongTin",
      align: "center",
      width: 150,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 200,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const handleThemCongViec = () => {
    DataThemHangMucCongViec(SelectedCongViec);
    handleCancel();
  };

  const handleCancel = () => {
    openModalFS(false);
    setSelectedCongViec([]);
    setSelectedKeys([]);
    setListHangMucCongViec([]);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedCongViec,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedCongViec = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedCongViec(newSelectedCongViec);
      setSelectedKeys(newSelectedKeys);
    },
  };

  return (
    <AntModal
      title="Thêm nội dung hạng mục công việc"
      open={openModal}
      width={width >= 1600 ? `70%` : width >= 1200 ? `85%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1000, y: "50vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={ListHangMucCongViec}
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
            marginTop: "10px",
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
              className="th-margin-bottom-0 btn-margin-bottom-0"
            >
              Quay lại
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleThemCongViec()}
              className="th-margin-bottom-0 btn-margin-bottom-0"
              type="primary"
              disabled={SelectedCongViec.length === 0}
            >
              Lưu nội dung
            </Button>
          </div>
        </div>
      </Card>
    </AntModal>
  );
}

export default ModalThemHangMucCongViec;
