import { SaveOutlined } from "@ant-design/icons";
import { Modal as AntModal, Form, Row, Input, Col, Button } from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table, EditableTableRow, Modal } from "src/components/Common";
import Helpers from "src/helpers";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalKiemSoatVatTuLapRap({ openModalFS, openModal, info, refesh }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListVatTuKiemSoat, setListVatTuKiemSoat] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListVatTuKiemSoat(info);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListVatTuKiemSoat = (info) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_TienDoSanXuat_Id: info.tits_qtsx_TienDoSanXuat_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/theo-doi-vat-tu-lap-rap?${param}`,
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
        setListVatTuKiemSoat(
          res.data.list_VatTus &&
            reDataForTable(JSON.parse(res.data.list_VatTus))
        );
        info.tenTram = res.data.tenTram;
      } else {
        setListVatTuKiemSoat([]);
      }
    });
  };

  const onSave = () => {
    let check = false;
    ListVatTuKiemSoat.forEach((vt) => {
      if (!vt.soSerial) {
        check = true;
      }
    });
    if (!check) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_TienDoSanXuat/theo-doi-vat-tu-lap-rap/${info.tits_qtsx_TienDoSanXuat_Id}`,
            "PUT",
            {
              tits_qtsx_TienDoSanXuat_Id: info.tits_qtsx_TienDoSanXuat_Id,
              list_VatTus: ListVatTuKiemSoat,
            },
            "DETAIL",
            "",
            resolve,
            reject
          )
        );
      }).then((res) => {
        if (res && res.status === 200) {
          Helpers.alertSuccessMessage("Đã lưu thành công!!");
          resetFields();
          openModalFS(false);
          refesh();
        }
      });
    } else {
      Helpers.alertWarning("Chưa nhập đủ số Serial cho vật tư");
    }
  };
  const modalXacNhan = (ham, title) => {
    Modal({
      type: "confirm",
      okText: "Xác nhận",
      cancelText: "Hủy",
      title: `Xác nhận ${title}`,
      onOk: ham,
    });
  };
  const changeGhiChu = (val, item, key) => {
    const ghiChu = val.target.value;
    const newData = [...ListVatTuKiemSoat];
    newData.forEach((sp, index) => {
      if (sp.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
        sp[key] = ghiChu;
      }
    });
    setListVatTuKiemSoat(newData);
  };

  const renderGhiChu = (item, key) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          value={item[key]}
          onChange={(val) => changeGhiChu(val, item, key)}
        />
      </>
    );
  };
  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Số Serial",
      render: (record) => renderGhiChu(record, "soSerial"),
      key: "soSerial",
      align: "center",
    },
    {
      title: "Ghi chú",
      key: "moTa",
      align: "center",
      render: (record) => renderGhiChu(record, "moTa"),
    },
  ];

  const columns = map(renderHead, (col) => {
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Theo dõi vật tư lắp ráp"
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Row justify={"center"} style={{ marginBottom: 10 }}>
        <Col span={1}></Col>
        <Col span={13} style={{ marginBottom: 10 }}>
          Trạm: <span style={{ fontWeight: "bold" }}>{info.tenTram}</span>
        </Col>
        <Col span={10} style={{ marginBottom: 10 }}>
          Thời gian vào trạm:{" "}
          <span style={{ fontWeight: "bold" }}>{info.thoiGianVaoTram}</span>
        </Col>
        <Col span={1}></Col>
        <Col span={13}>
          Sản phẩm:{" "}
          <span style={{ fontWeight: "bold" }}> {info.tenSanPham}</span>
        </Col>
        <Col span={10}>
          Số khung nội bộ:{" "}
          <span style={{ fontWeight: "bold" }}> {info.maNoiBo}</span>
        </Col>
      </Row>
      <Table
        bordered
        scroll={{ x: 800, y: "70vh" }}
        columns={columns}
        components={components}
        className="gx-table-responsive"
        dataSource={ListVatTuKiemSoat}
        size="small"
        pagination={false}
      />
      <Row style={{ marginTop: 10 }}>
        <Col span={24} align="center">
          <Button
            className="th-margin-bottom-0"
            style={{ margin: 0 }}
            icon={<SaveOutlined />}
            onClick={() => modalXacNhan(onSave, "Lưu theo dõi vật tư lắp ráp")}
            type="primary"
          >
            Lưu
          </Button>
        </Col>
      </Row>
    </AntModal>
  );
}

export default ModalKiemSoatVatTuLapRap;
