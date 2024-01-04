import {
  Modal as AntModal,
  Card,
  Input,
  Button,
  Row,
  Divider,
  Image,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { EditableTableRow, Table } from "src/components/Common";
import { isEmpty, map } from "lodash";
import { reDataForTable } from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalKetThuc({ openModalFS, openModal, itemData, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [DisabledXacNhan, setDisabledXacNhan] = useState(true);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (openModal) {
      const newData = itemData.map((dt) => {
        return {
          ...dt,
          soLuong: dt.soLuongChuaSanXuat,
        };
      });
      setListChiTiet(newData);
      setDisabledXacNhan(false);
    }
  }, [openModal]);

  const handleInputChange = (val, item) => {
    const slSanXuat = val.target.value;
    if (isEmpty(slSanXuat) || Number(slSanXuat) <= 0) {
      setDisabledXacNhan(true);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng sản xuất phải lớn hơn hoặc bằng 0 và bắt buộc";
    } else if (Number(slSanXuat) > Number(item.soLuongChuaSanXuat)) {
      setDisabledXacNhan(true);
      setEditingRecord([...editingRecord, item]);
      item.message =
        "Số lượng sản xuất không được lớn hơn số lượng chưa sản xuất";
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_ChiTiet_Id.toLowerCase() !==
          item.tits_qtsx_ChiTiet_Id.toLowerCase()
      );
      setEditingRecord(newData);
      newData.length === 0 && setDisabledXacNhan(false);
    }
    const newData = [...ListChiTiet];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTiet_Id.toLowerCase() ===
        item.tits_qtsx_ChiTiet_Id.toLowerCase()
      ) {
        ct.soLuong = slSanXuat;
      }
    });
    setListChiTiet(newData);
  };

  const renderSoLuongSanXuat = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_ChiTiet_Id.toLowerCase() ===
        item.tits_qtsx_ChiTiet_Id.toLowerCase()
      ) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
            borderColor: isEditing ? "red" : "",
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
    },
    {
      title: "Vật liệu",
      dataIndex: "vatLieu",
      key: "vatLieu",
      align: "center",
    },
    {
      title: "Quy cách chi tiết (mm)",
      align: "center",
      children: [
        {
          title: "Dài",
          dataIndex: "dai",
          key: "dai",
          align: "center",
          width: 70,
        },
        ,
        {
          title: "Rộng",
          dataIndex: "rong",
          key: "rong",
          align: "center",
          width: 70,
        },
        ,
        {
          title: "Dày",
          dataIndex: "day",
          key: "day",
          align: "center",
          width: 70,
        },
        {
          title: "Dn",
          dataIndex: "dn",
          key: "dn",
          align: "center",
          width: 70,
        },
        {
          title: "Dt",
          dataIndex: "dt",
          key: "dt",
          align: "center",
          width: 70,
        },
      ],
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "thoiGianBatDau",
      key: "thoiGianBatDau",
      align: "center",
      render: (value) => {
        return (
          <span
            style={{
              color: "#0469B9",
              fontSize: "13px",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "SL chưa sản xuất",
      dataIndex: "soLuongChuaSanXuat",
      key: "soLuongChuaSanXuat",
      align: "center",
      width: 70,
    },
    {
      title: "SL sản xuất",
      key: "soLuong",
      align: "center",
      width: 120,
      render: (record) => renderSoLuongSanXuat(record),
    },
    {
      title: "SL đã sản xuất",
      dataIndex: "soLuongDaSanXuat",
      key: "soLuongDaSanXuat",
      align: "center",
      width: 70,
    },
    {
      title: "Bản vẽ",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh bản vẽ"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
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

  const handleKetThuc = () => {
    const newData = ListChiTiet.map((chitiet) => {
      return {
        tits_qtsx_KanBanChiTietTram_Id: chitiet.tits_qtsx_KanBanChiTietTram_Id,
        tits_qtsx_KanBanChiTiet_Id: chitiet.tits_qtsx_KanBanChiTiet_Id,
        tits_qtsx_KanBan_Id: chitiet.tits_qtsx_KanBan_Id,
        tits_qtsx_ChiTiet_Id: chitiet.tits_qtsx_ChiTiet_Id,
        tits_qtsx_Tram_Id: chitiet.tits_qtsx_Tram_Id,
        tits_qtsx_ThietBi_Id: chitiet.tits_qtsx_ThietBi_Id,
        soLuong: chitiet.soLuong,
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan/may-san-xuat-ket-thuc`,
          "POST",
          newData,
          "KETTHUC",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setListChiTiet([]);
          openModalFS(false);
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    setListChiTiet([]);
    openModalFS(false);
    refesh();
  };

  return (
    <AntModal
      title={`Xác nhận số lượng sản xuất`}
      open={openModal}
      width={width > 1000 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Table
            bordered
            columns={columns}
            scroll={{ x: 1300, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListChiTiet)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
          />
          <Divider />
          <Row
            justify={"center"}
            style={{
              marginTop: 10,
            }}
          >
            <Button
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleKetThuc}
              disabled={DisabledXacNhan}
            >
              Xác nhận
            </Button>
          </Row>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalKetThuc;
