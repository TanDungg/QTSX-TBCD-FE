import {
  Modal as AntModal,
  Form,
  Row,
  Input,
  Button,
  Col,
  Checkbox,
  Tag,
} from "antd";
import { map } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table, EditableTableRow, Modal } from "src/components/Common";
import ImageDrawing from "src/routes/QTSX_TITS/SanXuat/TienDoSanXuat/ImageDrawing";
import { BASE_URL_API, DEFAULT_FORM_CONGDOAN } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  newTreeToFlatlist,
  reDataForTable,
} from "src/util/Common";
import KiemSoatChatLuongTaiTramCanva from "./KiemSoatChatLuongTaiTramCanva";
import { SaveOutlined } from "@ant-design/icons";
import Helpers from "src/helpers";
const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalKiemSoatChatLuong({ openModalFS, openModal, info }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListHangMucKiemTra, setListHangMucKiemTra] = useState([]);
  const [ListHinhAnh, setListHinhAnh] = useState([]);

  useEffect(() => {
    if (openModal) {
      getHoSoChatLuong(info);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getHoSoChatLuong = (info) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_TienDoSanXuat_Id: info.tits_qtsx_TienDoSanXuat_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/kiem-soat-chat-luong-tai-tram?${param}`,
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
        setListHangMucKiemTra(res.data.list_TDSXKiemSoatChatLuongs);
        const newData = [];
        res.data.list_TDSXKiemSoatChatLuongs.forEach((ct) => {
          newData.push(...ct.list_HinhAnhs);
        });
        setListHinhAnh(newData);
      } else {
        setListHangMucKiemTra([]);
        setListHinhAnh([]);
      }
    });
  };

  //   const getListXuong = (congDoan_Id) => {
  //     const param = convertObjectToUrlParams({
  //       congDoan_Id,
  //     });
  //     new Promise((resolve, reject) => {
  //       dispatch(
  //         fetchStart(
  //           `tits_qtsx_Xuong?${param}&page=-1`,
  //           "GET",
  //           null,
  //           "DETAIL",
  //           "",
  //           resolve,
  //           reject
  //         )
  //       );
  //     }).then((res) => {
  //       if (res && res.data) {
  //         setListXuong(res.data);
  //       } else {
  //         setListXuong([]);
  //       }
  //     });
  //   };

  //   const onFinish = (values) => {
  //     const data = values.themcongdoan;
  //     const congdoan = ListHangMucKiemTra.filter(
  //       (d) => d.id === data.tits_qtsx_CongDoan_Id
  //     );
  //     const xuong = ListXuong.filter((d) => d.id === data.tits_qtsx_Xuong_Id);
  //     const newData = {
  //       ...data,
  //       tenCongDoan: congdoan[0].tenCongDoan,
  //       maCongDoan: congdoan[0].maCongDoan,
  //       tenXuong: xuong[0].tenXuong,
  //       maXuong: xuong[0].maXuong,
  //       list_Trams: [],
  //     };
  //     DataThemCongDoan(newData);
  //     resetFields();
  //     openModalFS(false);
  //   };

  //   const handleOnSelectCongDoan = (value) => {
  //     getListXuong(value);
  //   };
  let renderNoiDung = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Nội dung",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tiêu chuẩn đánh giá",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Giá trị tiêu chuẩn",
      dataIndex: "soSerial",
      key: "soSerial",
      align: "center",
    },
    {
      title: "Đánh giá",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
  ];
  const handleInputChange = (val, item) => {
    const ketQua = val.target.value;
    const newData = [...ListHangMucKiemTra];
    newData.forEach((ct, index) => {
      ct.list_TDSXKiemSoatChatLuongChiTiets.forEach((clct) => {
        if (
          clct.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id ===
          item.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id
        ) {
          clct.ketQua = ketQua;
          clct.isDat =
            item.giaTriMin <= ketQua && ketQua <= item.giaTriMax ? true : false;
        }
      });
    });
    setListHangMucKiemTra(newData);
  };

  const rendersoLuong = (item) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.ketQua}
          onChange={(val) => handleInputChange(val, item)}
        />
      </>
    );
  };
  let renderThongSo = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Nội dung",
      dataIndex: "noiDungKiemTra",
      key: "noiDungKiemTra",
      align: "center",
    },
    {
      title: "Giá trị MIN",
      dataIndex: "giaTriMin",
      key: "giaTriMin",
      align: "center",
    },
    {
      title: "Giá trị MAX",
      dataIndex: "giaTriMax",
      key: "giaTriMax",
      align: "center",
    },
    {
      title: "Kết quả",
      // dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
      render: (val) => rendersoLuong(val),
    },
    {
      title: "Đánh giá",
      dataIndex: "isDat",
      key: "isDat",
      align: "center",
      render: (val) => (
        <Tag color={val ? "green" : "red"}>{val ? "Đạt" : "Không đạt"} </Tag>
      ),
    },
    {
      title: "Lỗi",
      dataIndex: "list_TDSXKiemSoatChatLuongChiTietLois",
      key: "list_TDSXKiemSoatChatLuongChiTietLois",
      align: "center",
      render: (val) =>
        val.map((l) => {
          return <Tag color="green">{l.tenLoi}</Tag>;
        }),
    },
  ];
  const columns = map(renderThongSo, (col) => {
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
  const AddLoi = (data) => {
    const newData = [...ListHangMucKiemTra];
    newData.forEach((hm) => {
      hm.list_TDSXKiemSoatChatLuongChiTiets.forEach((ct) => {
        if (
          ct.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id ===
          data.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id
        ) {
          ct.list_TDSXKiemSoatChatLuongChiTietLois = [
            ...ct.list_TDSXKiemSoatChatLuongChiTietLois,
            data,
          ];
        }
      });
      hm.list_HinhAnhs.forEach((ha) => {
        if (
          ha.tits_qtsx_SanPhamHinhAnh_Id === data.tits_qtsx_SanPhamHinhAnh_Id
        ) {
          if (ha.listViTri) {
            ha.listViTri = [...ha.listViTri, data.viTri];
          } else {
            ha.listViTri = [data.viTri];
          }
        }
      });
    });
    setListHangMucKiemTra(newData);
  };
  const onSave = () => {
    let check = false;
    ListHangMucKiemTra.forEach((hm) => {
      hm.list_TDSXKiemSoatChatLuongChiTiets.forEach((lct) => {
        if (lct.isDat === undefined) {
          check = true;
        }
      });
    });
    if (!check) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_TienDoSanXuat/kiem-soat-chat-luong`,
            "PUT",
            {
              tits_qtsx_TienDoSanXuat_Id: info.tits_qtsx_TienDoSanXuat_Id,
              list_TDSXKiemSoatChatLuongs: ListHangMucKiemTra,
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
        }
      });
    } else {
      Helpers.alertWarning("Chưa nhập đủ kết quả nội dung kiểm tra");
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
  return (
    <AntModal
      title="Kiểm soát chất lượng"
      open={openModal}
      width={`95%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Row justify={"center"} style={{ marginBottom: 10 }}>
        <Col span={1}></Col>
        <Col span={13} style={{ marginBottom: 10 }}>
          Trạm: <span style={{ fontWeight: "bold" }}>&nbsp;{info.tenTram}</span>
        </Col>
        <Col span={10} style={{ marginBottom: 10 }}>
          Thời gian vào trạm:{" "}
          <span style={{ fontWeight: "bold" }}>
            &nbsp;{info.thoiGianVaoTram}
          </span>
        </Col>
        <Col span={1}></Col>
        <Col span={13}>
          Sản phẩm:{" "}
          <span style={{ fontWeight: "bold" }}>&nbsp;{info.tenSanPham}</span>
        </Col>
        <Col span={10}>
          Số khung nội bộ:{" "}
          <span style={{ fontWeight: "bold" }}>&nbsp;{info.maNoiBo}</span>
        </Col>
      </Row>
      {ListHangMucKiemTra.length > 0 &&
        ListHangMucKiemTra.map((hmkt) => {
          return (
            <Row>
              <Col span={12}>
                <Row>
                  <Col span={24} style={{ marginBottom: 10 }}>
                    <span style={{ marginBottom: 10, display: "block" }}>
                      Hạng mục kiểm tra:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {hmkt.tenHangMucKiemTra}
                      </span>
                    </span>
                    <Table
                      bordered
                      scroll={{ x: 800, y: "70vh" }}
                      columns={columns}
                      components={components}
                      className="gx-table-responsive"
                      dataSource={reDataForTable(
                        hmkt.list_TDSXKiemSoatChatLuongChiTiets
                      )}
                      size="small"
                      pagination={false}
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={12} align="center" style={{ position: "relative" }}>
                {hmkt.list_HinhAnhs.length > 0 &&
                  hmkt.list_HinhAnhs.map((ha) => {
                    return (
                      <ImageDrawing
                        imageUrl={BASE_URL_API + ha.hinhAnh}
                        hinhAnhId={ha.tits_qtsx_SanPhamHinhAnh_Id}
                        dataNoiDung={hmkt}
                        setListHangMucKiemTra={setListHangMucKiemTra}
                        AddLoi={AddLoi}
                        listViTri={ha.listViTri}
                      />
                    );
                  })}
              </Col>
            </Row>
          );
        })}
      <Row style={{ marginTop: 10 }}>
        <Col span={24} align="center">
          <Button
            style={{ margin: 0 }}
            icon={<SaveOutlined />}
            onClick={() => modalXacNhan(onSave, "Lưu kiểm soát chất lượng")}
            type="primary"
          >
            Lưu
          </Button>
        </Col>
      </Row>
    </AntModal>
  );
}

export default ModalKiemSoatChatLuong;
