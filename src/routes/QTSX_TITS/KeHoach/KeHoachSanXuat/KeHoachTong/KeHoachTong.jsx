import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Card, Row, Col, DatePicker, Button, Popover } from "antd";

import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "src/components/Common";
import { getNamNow, getNumberDayOfMonth, getThangNow } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable, getLocalStorage } from "src/util/Common";

import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import EditKeHoach from "./EditKeHoach";
import { convertObjectToUrlParams } from "src/util/Common";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;

function KeHoachTong({ match, history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const INFO = getLocalStorage("menu");
  const [Xuong, setXuong] = useState("");
  const [data, setData] = useState([]);
  const [VersionSelect, setVersionSelect] = useState([]);
  const [Thang, setThang] = useState(getThangNow());
  const [Nam, setNam] = useState(getNamNow());
  const [ActiveEditKeHoach, setActiveEditKeHoach] = useState(false);
  const [Version, setVersion] = useState("");
  const [dataEdit, setDataEdit] = useState({});
  useEffect(() => {
    if (permission && permission.view) {
      getVersion(Thang, Nam);
    } else if (permission && !permission.view) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load danh sách người dùng
   * @param KeHoach Từ khóa
   * @param phongBan_Id loại xe id
   * @param thangNam tháng năm
   */
  const getListData = (thang, nam, tits_qtsx_KeHoachVersion_Id) => {
    let param = convertObjectToUrlParams({
      thang,
      nam,
      tits_qtsx_KeHoachVersion_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KeHoach?${param}`,
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
          const newData = res.data.map((sp) => {
            const ctkh = {};
            let t = 0;
            JSON.parse(sp.chiTietKeHoach).forEach((ct) => {
              ctkh[`ngay${ct.ngay}`] = {
                soLuong: ct.tongSoLuong,
                keHoach_Id: ct.keHoach_Id,
                ngay: ct.ngay,
                sanPham_Id: sp.sanPham_Id,
                thang: ct.thang,
                nam: ct.nam,
                tenSanPham: sp.tenSanPham,
              };
              t = t + ct.tongSoLuong;
            });
            return {
              maSanPham: sp.maSanPham,
              tenSanPham: sp.tenSanPham,
              sanPham_Id: sp.sanPham_Id,
              tong: t > 0 ? t : 0,
              ...ctkh,
            };
          });
          setData(newData);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getVersion = (t, n) => {
    const params = convertObjectToUrlParams({
      IsSanXuat: true,
      thang: t,
      nam: n,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KeHoach/list-version-ke-hoach?${params}`,
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
        if (res && res.data.length > 0) {
          setVersionSelect(res.data);
          setVersion(res.data[0].version_Id);
          getListData(t, n, res.data[0].version_Id);
        } else {
          getListData(t, n);
          setVersion("");
          setVersionSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      `của sản phẩm ${item.tenSanPham} tháng ${Thang}/${Nam}`,
      "kế hoạch"
    );
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const params = convertObjectToUrlParams({
      phongban_Id: Xuong,
      sanPham_Id: item.sanPham_Id,
      nam: Nam,
      thang: Thang,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_KeHoach?${params}`,
          "DELETE",
          "",
          "DELETE",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          getVersion(Xuong, Thang, Nam);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission &&
      permission.del &&
      VersionSelect.length > 0 &&
      Version === VersionSelect[0].version_Id
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
      fixed: width > 768 ? "left" : "none",
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      width: 120,
      fixed: width > 768 ? "left" : "none",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      align: "center",
      key: "tenSanPham",
      width: 120,
      fixed: width > 768 ? "left" : "none",
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "tenLoaiSanPham",
      align: "center",
      key: "tenLoaiSanPham",
      width: 120,
      fixed: width > 768 ? "left" : "none",
    },
    {
      title: `Tháng ${Thang} năm ${Nam}`,
      children: new Array(getNumberDayOfMonth(Thang, Nam))
        .fill(null)
        .map((_, i) => {
          const id = String(i + 1);
          return {
            title: id,
            dataIndex: `ngay${id}`,
            key: `ngay${id}`,
            align: "center",
            width: 40,
          };
        }),
    },
    {
      title: "Tổng",
      dataIndex: "tong",
      align: "center",
      key: "tong",
      width: 50,
    },
    {
      title: "Chức năng",
      align: "center",
      key: "action",
      width: 80,
      render: (item) => actionContent(item),
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

  const handleOnSelectXuong = (value) => {
    setXuong(value);
    getVersion(value, Thang, Nam);
  };
  const handleOnSelectVersion = (value) => {
    getListData(Xuong, Thang, Nam, value);
    setVersion(value);
  };
  const handleOnChangeDate = (dateString) => {
    const Thang = dateString.slice(0, 2);
    const Nam = dateString.slice(-4);
    setThang(Thang);
    setNam(Nam);
    getVersion(Xuong, Thang, Nam);
  };
  const { totalRow } = data;
  const handleClearVersion = (value) => {
    getListData(Xuong, Thang, Nam);
    setVersion(null);
  };
  const handleImport = () => {
    history.push(`${match.url}/import`);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<UploadOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleImport}
          disabled={permission && !permission.add}
        >
          Import
        </Button>
      </>
    );
  };

  const dataList = reDataForTable(data);
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Kế hoạch"}
        description="Kế hoạch"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Tháng:</h5>
            <DatePicker
              allowClear={false}
              format={"MM/YYYY"}
              style={{ width: "100%" }}
              placeholder="Chọn tháng"
              picker="month"
              value={moment(Thang + "/" + Nam, "MM/YYYY")}
              onChange={(date, dateString) => handleOnChangeDate(dateString)}
            />
          </Col>

          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Version:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={VersionSelect ? VersionSelect : []}
              placeholder={"Version hiện hành"}
              optionsvalue={["version_Id", "version"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectVersion}
              onChange={(value) => setVersion(value)}
              value={Version}
              allowClear
              onClear={handleClearVersion}
            />
          </Col>
        </Row>
        <Table
          style={{ marginTop: 10 }}
          bordered
          scroll={{ x: 1500 }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            total: totalRow,
            pageSize: 20,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
      <EditKeHoach
        openModal={ActiveEditKeHoach}
        openModalFS={setActiveEditKeHoach}
        data={dataEdit}
        refesh={() => {}}
      />
    </div>
  );
}

export default KeHoachTong;
