import {
  Modal as AntModal,
  Form,
  Row,
  Input,
  Button,
  Col,
  Tag,
  Divider,
} from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table, EditableTableRow, Modal } from "src/components/Common";
import ImageDrawing from "src/routes/QTSX_TITS/SanXuat/TienDoSanXuat/ImageDrawing";
import { BASE_URL_API } from "src/constants/Config";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";

import { SaveOutlined } from "@ant-design/icons";
import Helpers from "src/helpers";
const { EditableRow, EditableCell } = EditableTableRow;

function ModalKiemSoatChatLuong({ openModalFS, openModal, info, refesh }) {
  const dispatch = useDispatch();
  // const { width } = useSelector(({ common }) => common).toJS();
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListHangMucKiemTra, setListHangMucKiemTra] = useState([]);
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
        res.data.list_TDSXKiemSoatChatLuongs.forEach((ks) => {
          ks.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
            tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((ct) => {
              if (ct.isNoiDung) {
                if (ct.list_TDSXKiemSoatChatLuongChiTietLois.length === 0) {
                  ct.isDat = true;
                }
              }
              // else{
              //   ct.list_TDSXKiemSoatChatLuongChiTietLois.forEach(ctl =>{
              //     ks.list_HinhAnhs.forEach(ha =>{
              //       if(ctl)
              //     })
              //   })
              // }
            });
          });
        });
        setListHangMucKiemTra(res.data.list_TDSXKiemSoatChatLuongs);
      } else {
        setListHangMucKiemTra([]);
      }
    });
  };
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
      dataIndex: "noiDungKiemTra",
      key: "noiDungKiemTra",
      align: "center",
    },
    {
      title: "Tiêu chuẩn đánh giá",
      dataIndex: "tieuChuanDanhGia",
      key: "tieuChuanDanhGia",
      align: "center",
    },
    {
      title: "Giá trị tiêu chuẩn",
      dataIndex: "giaTriTieuChuan",
      key: "giaTriTieuChuan",
      align: "center",
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
          return <Tag color="green">{JSON.parse(l.viTri).maLoi}</Tag>;
        }),
    },
  ];
  const handleInputChange = (val, item) => {
    const ketQua = val.target.value;
    const newData = [...ListHangMucKiemTra];
    newData.forEach((ct, index) => {
      ct.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
        if (
          tdp.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id ===
          item.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id
        ) {
          tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((clct) => {
            if (
              clct.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id ===
              item.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id
            ) {
              clct.ketQua = ketQua;
              if (clct.list_TDSXKiemSoatChatLuongChiTietLois.length === 0) {
                clct.isDat =
                  item.giaTriMin <= ketQua && ketQua <= item.giaTriMax
                    ? true
                    : false;
              }
            }
          });
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
          return <Tag color="green">{l.maLoi}</Tag>;
        }),
    },
  ];

  const columnThongSos = map(renderThongSo, (col) => {
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
  const columnNoiDungs = map(renderNoiDung, (col) => {
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
      hm.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
        if (
          tdp.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id ===
          data.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id
        ) {
          tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((ct) => {
            if (
              ct.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id ===
              data.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id
            ) {
              ct.isDat = false;
              ct.list_TDSXKiemSoatChatLuongChiTietLois = [
                ...ct.list_TDSXKiemSoatChatLuongChiTietLois,
                data,
              ];
            }
          });
        }
      });
      hm.list_HinhAnhs.forEach((ha) => {
        if (
          ha.tits_qtsx_HangMucKiemTra_HinhAnh_Id ===
          data.tits_qtsx_HangMucKiemTra_HinhAnh_Id
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
  const xoaToaDo = (data) => {
    const newData = [...ListHangMucKiemTra];
    newData.forEach((hm) => {
      hm.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
        if (
          tdp.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id ===
          data.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id
        ) {
          tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((ct) => {
            if (
              ct.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id ===
              data.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id
            ) {
              ct.list_TDSXKiemSoatChatLuongChiTietLois =
                ct.list_TDSXKiemSoatChatLuongChiTietLois.filter(
                  (ctl) => ctl.viTri !== data.viTri
                );
              if (ct.list_TDSXKiemSoatChatLuongChiTietLois.length === 0) {
                ct.isDat =
                  ct.giaTriMin <= ct.ketQua && ct.giaTriMax >= ct.ketQua
                    ? true
                    : false;
              }
            }
          });
        }
      });
      hm.list_HinhAnhs.forEach((ha) => {
        if (
          ha.tits_qtsx_HangMucKiemTra_HinhAnh_Id ===
          data.tits_qtsx_HangMucKiemTra_HinhAnh_Id
        ) {
          if (ha.listViTri) {
            ha.listViTri = ha.listViTri.filter((vt) => vt !== data.viTri);
          }
        }
      });
    });
    setListHangMucKiemTra([...newData]);
  };
  const onSave = () => {
    let check = false;
    ListHangMucKiemTra.forEach((hm) => {
      hm.list_TDSXKiemSoatChatLuongTieuDePhus.forEach((tdp) => {
        tdp.list_TDSXKiemSoatChatLuongChiTiets.forEach((lct) => {
          if (lct.isDat === undefined) {
            check = true;
          }
        });
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
          refesh();
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
      <Divider />
      {ListHangMucKiemTra.length > 0 &&
        ListHangMucKiemTra.map((hmkt, index) => {
          return (
            <>
              <Row key={index}>
                <Col xl={12} lg={24}>
                  <Row>
                    <Col
                      span={24}
                      style={{
                        marginBottom: 10,
                        position: "relative",
                        height: 301,
                        overflow: "auto",
                      }}
                    >
                      <span style={{ marginBottom: 10, display: "block" }}>
                        Hạng mục kiểm tra:{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {hmkt.tenHangMucKiemTra}
                        </span>
                      </span>
                      {hmkt.list_TDSXKiemSoatChatLuongTieuDePhus.map((tdp) => {
                        if (tdp.list_TDSXKiemSoatChatLuongChiTiets.length > 0) {
                          return (
                            <>
                              {tdp.tieuDePhu && (
                                <span
                                  style={{ marginBottom: 10, display: "block" }}
                                >
                                  Hạng mục:{" "}
                                  <span style={{ fontWeight: "bold" }}>
                                    {tdp.tieuDePhu}
                                  </span>
                                </span>
                              )}
                              <Table
                                bordered
                                scroll={{ x: 800, y: "70vh" }}
                                columns={
                                  hmkt.isNoiDung
                                    ? columnNoiDungs
                                    : columnThongSos
                                }
                                components={components}
                                className="gx-table-responsive"
                                dataSource={reDataForTable(
                                  tdp.list_TDSXKiemSoatChatLuongChiTiets
                                )}
                                size="small"
                                pagination={false}
                              />
                            </>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </Col>
                  </Row>
                </Col>
                <Col
                  xl={12}
                  lg={24}
                  align="center"
                  style={{
                    position: "relative",
                    height: 301,
                    overflow: "auto",
                  }}
                >
                  {hmkt.list_HinhAnhs.length > 0 &&
                    hmkt.list_HinhAnhs.map((ha) => {
                      return (
                        <ImageDrawing
                          imageUrl={BASE_URL_API + ha.hinhAnh}
                          hinhAnhId={ha.tits_qtsx_HangMucKiemTra_HinhAnh_Id}
                          sanPhamhinhAnhId={ha.tits_qtsx_SanPhamHinhAnh_Id}
                          dataNoiDung={hmkt}
                          setListHangMucKiemTra={setListHangMucKiemTra}
                          AddLoi={AddLoi}
                          listViTri={ha.listViTri}
                          xoaToaDo={xoaToaDo}
                          chamLoi={true}
                        />
                      );
                    })}
                </Col>
              </Row>
              <Divider />
            </>
          );
        })}
      <Row style={{ marginTop: 10 }}>
        <Col span={24} align="center">
          <Button
            className="th-margin-bottom-0"
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
