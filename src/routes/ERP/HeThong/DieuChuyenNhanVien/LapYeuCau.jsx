import React, { useState, useEffect } from "react";
import { Card, Button, Col, Row, DatePicker, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { find, remove } from "lodash";
import ModalAddCBNV from "./ModalAddCBNV";
import {
  ModalDeleteConfirm,
  Table,
  TreeSelectRole,
  Modal,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { getCookieValue, reDataForTable, getDateNow } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import ModalSetting from "./ModalSetting";
import { useLocation } from "react-router-dom";
import includes from "lodash/includes";

function LapDieuChuyen({ history, match, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [type, setType] = useState("new");
  const [disableModalAdd, setDisableModalAdd] = useState(false);
  const [disableModalSetting, setDisableModalSetting] = useState(false);

  const [donViDiSelect, setDonViDiSelect] = useState([]);
  const [donViDenSelect, setDonViDenSelect] = useState([]);

  const [donViDi, setDonViDi] = useState("");
  const [donViDen, setDonViDen] = useState("");
  const [ngayDieuChuyen, setNgayDieuChuyen] = useState(getDateNow());
  const [info, setInfo] = useState([]);

  const [selectCBNV, setSelectCBNV] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const [expandedKeysDonViDi, setExpandedKeysDonViDi] = useState([]);
  const [expandedKeysDonViDen, setExpandedKeysDonViDen] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && !permission.add) {
          history.push("/home");
        } else {
          setType("new");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && !permission.add) {
          history.push("/home");
        } else {
          setType("detail");
          getInfo(match.params.id);
        }
      } else {
        if (permission && !permission.edit) {
          history.push("/home");
        } else {
          if (match.params.id) {
            setType("edit");
            getInfo(match.params.id);
          }
        }
      }
    };
    getDonViDi();
    getDonViDen();

    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DieuChuyenNhanVien/${id}`,
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
        if (res.data) {
          const newData = res.data;
          const nv = JSON.parse(newData.ChiTietThietBi);
          setNgayDieuChuyen(newData.ngayDieuChuyen);
          setDonViDi(
            newData.tapDoan_Id +
              "_" +
              newData.donViLapDieuChuyenId +
              "_" +
              newData.phongBan_Id +
              (newData.boPhan_Id === null ? "" : "_" + newData.boPhan_Id)
          );
          setDonViDen(
            newData.tapDoanNew_Id +
              "_" +
              newData.donViDieuChuyenDenId +
              "_" +
              newData.phongBanNew_Id +
              (newData.boPhanNew_Id === null ? "" : "_" + newData.boPhanNew_Id)
          );
          setExpandedKeysDonViDen([
            newData.tapDoanNew_Id + "_" + newData.donViDieuChuyenDenId,
            newData.tapDoanNew_Id +
              "_" +
              newData.donViDieuChuyenDenId +
              "_" +
              newData.phongBanNew_Id,
          ]);
          setExpandedKeysDonViDi([
            newData.tapDoan_Id + "_" + newData.donViLapDieuChuyenId,
            newData.tapDoan_Id +
              "_" +
              newData.donViLapDieuChuyenId +
              "_" +
              newData.phongBan_Id,
          ]);
          setData(nv);
          setInfo(newData);
        }
      })
      .catch((error) => console.error(error));
  };
  const getDonViDi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `RoleByDonVi/dropdown-by-role`,
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
          setDonViDiSelect(res.data[0].children);
        }
      })
      .catch((error) => console.error(error));
  };
  const getDonViDen = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/dropdown`,
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
          setDonViDenSelect(res.data[0].children);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    // setPage(pagination);
    // getListData(pagination, pageSize);
  };

  const goBack = () => {
    if (location.state) {
      const { dieuChuyen } = location && location.state;
      if (dieuChuyen) {
        history.push("/he-thong/dieu-chuyen-cbnv");
      }
    } else if (type === "edit" || type === "new") {
      history.push("/he-thong/dieu-chuyen-cbnv");
    } else {
      history.push("/he-thong/tiep-nhan-dieu-chuyen-cbnv");
    }
  };

  const error = (content) => {
    message.error({
      type: "error",
      content: content,
    });
  };

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectCBNV,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectCBNV(selectedRows);
      setSelectedKeys(selectedRowKeys);
    },
  };
  /**
   * ActionContent: Hành động trên bảng
   *
   * @param {*} item
   * @returns View
   */
  const actionContent = (item) => {
    const deleteItemVal =
      type === "detail"
        ? { disabled: true }
        : { onClick: () => deleteItemFunc(item) };

    return (
      <React.Fragment>
        <a {...deleteItemVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </React.Fragment>
    );
  };

  /**
   * deleteItem: Xoá item theo item
   *
   * @param {number} item
   * @returns
   */
  const deleteItemFunc = async (item) => {
    ModalDeleteConfirm(deleteItemAction, item, "", item.fullName);
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = data.filter((d) => d.id !== item.id);
    setData(newData);
  };
  /**
   * Hiển thị bảng
   *
   * @returns
   */
  const header = () => {
    let renderHead = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 50,
        align: "center",
        fixed: "left",
      },
      {
        title: "Mã nhân viên",
        dataIndex: "maNhanVien",
        key: "maNhanVien",
        align: "center",
      },
      {
        title: "Họ tên",
        dataIndex: "fullName",
        align: "center",
        key: "fullName",
      },
      {
        title: "Đơn vị trả lương",
        dataIndex: "tenDonViTraLuong",
        key: "tenDonViTraLuong",
        align: "center",
      },
      {
        title: "Ghi chú",
        dataIndex: "ghiChu",
        key: "ghiChu",
        align: "center",
      },
    ];
    renderHead = [
      ...renderHead,
      {
        title: "Xóa",
        key: "action",
        align: "center",
        width: 45,
        render: (value) => actionContent(value),
        fixed: "right",
      },
    ];
    return renderHead;
  };
  const handleSave = () => {
    const donvidi = donViDi.split("_");
    const donviden = donViDen.split("_");
    const ngay = ngayDieuChuyen.split("/");
    const newData = {
      user_Id: type === "new" ? getCookieValue("tokenInfo").id : info.nguoiLap,
      donVi_Id: donvidi[1],
      boPhan_Id: donvidi[3],
      phongBan_Id: donvidi[2],
      donViNew_Id: donviden[1],
      phongBanNew_Id: donviden[2],
      boPhanNew_Id: donviden[3],
      tapDoanNew_Id: donvidi[0],
      tapDoan_Id: donviden[0],
      ngayDieuChuyen: `${ngay[1]}-${ngay[0]}-${ngay[2]}`,
      lstcbnvdc: data.map((d) => {
        return {
          user_Id: d.id,
          donViTraLuongNew_Id:
            d.donViTraLuong_Id === undefined
              ? d.donViTraLuongNew_Id
              : d.donViTraLuong_Id,
          ghiChu: d.ghiChu,
        };
      }),
    };
    if (type === "edit") {
      newData.id = info.id;
    }
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          type === "new"
            ? `DieuChuyenNhanVien`
            : `DieuChuyenNhanVien/${info.id}`,
          type === "new" ? "POST" : "PUT",
          newData,
          type === "new" ? "ADD" : "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status === 200) {
          setDonViDen("");
          setDonViDi("");
          setSelectCBNV([]);
          setSelectedKeys([]);
          setData([]);
        } else if (res.status === 204) {
          setSelectCBNV([]);
          setSelectedKeys([]);
          getInfo(info.id);
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title:
      type === "new" ? "Xác nhận điều chuyển" : "Xác nhận cập nhật điều chuyển",
    onOk: handleSave,
  };
  const modalXK = () => {
    Modal(prop);
  };
  const handleAdd = () => {
    setDisableModalAdd(true);
  };
  const handleSetting = () => {
    setDisableModalSetting(true);
  };

  /**
   * Hiển thị button thêm
   *
   * @returns
   */
  const addButtonRender = () => {
    return (
      <>
        <Button
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleAdd}
          disabled={donViDi === "" || type === "detail" ? true : false}
        >
          Thêm
        </Button>
        <Button
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleSetting}
          disabled={selectCBNV.length === 0 || type === "detail" ? true : false}
        >
          Thiết lập
        </Button>
        <Button
          className="th-margin-bottom-0"
          type="primary"
          onClick={modalXK}
          disabled={
            (donViDi === "" && donViDen === "" && data.length === 0) ||
            type === "detail"
              ? true
              : false
          }
        >
          {type === "new" ? "Lưu" : "Cập nhật"}
        </Button>
      </>
    );
  };

  const { totalRow, pageSize } = data;
  const dataList = reDataForTable(data);

  const handleSelectDonViDi = (val) => {
    if (donViDen === val) {
      error("Đơn vị lập điều chuyển không thể giống đơn vị điều chuyển đến");
    } else {
      if (val !== donViDi) {
        setDonViDi(val);
        setData([]);
        setSelectCBNV([]);
        setSelectedKeys([]);
      }
    }
  };
  const handleSelectDonViDen = (val) => {
    if (donViDi === val) {
      error("Đơn vị điều chuyển đến không thể giống đơn vị lập điều chuyển");
    } else {
      setDonViDen(val);
    }
  };
  const addData = (dl) => {
    const newData = dl;
    data.forEach((d) => {
      dl.forEach((dt, index) => {
        if (d.id === dt.id) {
          newData.splice(index, 1);
        }
      });
    });
    setData([...data, ...newData]);
  };
  const addDonViTraLuong = (dl) => {
    const newData = data;
    newData.forEach((dt, index) => {
      dl.NV.forEach((d) => {
        if (d === dt.id) {
          newData[index].donViTraLuong_Id = dl.dt[0];
          newData[index].tenDonViTraLuong = dl.dt[1];
          newData[index].ghiChu = dl.ghiChu;
        }
      });
    });
    setData(newData);
  };

  function hanldeRemoveSelected(CBNV) {
    const newCBNV = remove(selectCBNV, (d) => {
      return d.key !== CBNV.key;
    });
    const newKeys = remove(selectedKeys, (d) => {
      return d !== CBNV.key;
    });
    setSelectCBNV(newCBNV);
    setSelectedKeys(newKeys);
  }
  const title =
    type === "detail"
      ? "Chi tiết phiếu điều chuyển cán bộ nhân viên"
      : type === "edit"
      ? "Cập nhật phiếu điều chuyển cán bộ nhân viên"
      : "Lập điều chuyển cán bộ nhân viên";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={title} description={title} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Row>
          <Col
            xxl={8}
            xl={8}
            lg={8}
            md={8}
            sm={19}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Đơn vị lập điều chuyển</h5>
            <TreeSelectRole
              style={{ width: "100%" }}
              placeholder="Chọn đơn vị"
              datatreeselect={donViDiSelect}
              options={["nameId", "name", "children", "disable"]}
              onSelect={handleSelectDonViDi}
              value={donViDi.length > 0 ? donViDi : null}
              treeExpandedKeys={expandedKeysDonViDi}
              onTreeExpand={(expanKey) => setExpandedKeysDonViDi(expanKey)}
            />
          </Col>

          <Col
            xxl={8}
            xl={8}
            lg={8}
            md={8}
            sm={19}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Đơn vị điều chuyển đến</h5>
            <TreeSelectRole
              style={{ width: "100%" }}
              placeholder="Chọn đơn vị"
              datatreeselect={donViDenSelect}
              onSelect={handleSelectDonViDen}
              options={["nameId", "name", "children", "disable"]}
              onTreeExpand={(expanKey) => setExpandedKeysDonViDen(expanKey)}
              treeExpandedKeys={expandedKeysDonViDen}
              value={donViDen.length > 0 ? donViDen : null}
            />
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={8}
            md={8}
            sm={10}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Ngày điều chuyển</h5>
            <DatePicker
              format={"DD/MM/YYYY"}
              value={moment(ngayDieuChuyen, "DD/MM/YYYY")}
              onChange={(date, dateString) => setNgayDieuChuyen(dateString)}
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>
      <Card
        className="th-card-margin-bottom"
        title="Danh sách cán bộ nhân viên"
        extra={addButtonRender()}
      >
        <Table
          bordered
          cscroll={{ x: 700, y: "55vh" }}
          columns={header()}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedKeys,
            getCheckboxProps: (record) => ({
              disabled: type === "detail",
            }),
          }}
          onRow={(record, rowIndex) =>
            type !== "detail" && {
              onClick: (e) => {
                const found = find(selectedKeys, (k) => k === record.key);
                if (found === undefined) {
                  setSelectCBNV([record]);
                  setSelectedKeys([record.key]);
                } else {
                  hanldeRemoveSelected(record);
                }
              },
            }
          }
        />
      </Card>
      <ModalAddCBNV
        openModal={disableModalAdd}
        openModalFS={setDisableModalAdd}
        boPhan_Id={donViDi}
        openModalData={addData}
      />
      <ModalSetting
        openModal={disableModalSetting}
        openModalFS={setDisableModalSetting}
        CBNV={selectCBNV}
        openAddDVTL={addDonViTraLuong}
      />
    </div>
  );
}
export default LapDieuChuyen;
