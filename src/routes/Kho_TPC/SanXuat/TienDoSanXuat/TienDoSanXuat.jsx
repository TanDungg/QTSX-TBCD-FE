import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  // CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { setHistory } from "src/appRedux/actions";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function TienDoSanXuat({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const { option, path } = useSelector(({ History }) => History);

  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [ListXuong, setListXuong] = useState([]);
  const [Xuong, setXuong] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      if (path === match.url) {
        setFromDate(option.FromDate);
        setToDate(option.ToDate);
        setXuong(option.Xuong);
        setPage(option.page);
        setKeyword(option.keyword);
        loadData(
          option.keyword,
          option.Xuong,
          option.FromDate,
          option.ToDate,
          option.page
        );
      } else {
        loadData(keyword, Xuong, FromDate, ToDate, page);
      }
      getXuong();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy dữ liệu về
   *
   */
  const loadData = (keyword, PhongBan_Id, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      PhongBan_Id,
      tuNgay,
      denNgay,
      keyword,
      page,
    });
    dispatch(
      fetchStart(`lkn_PhieuNhapTienDoSanXuat?${param}`, "GET", null, "LIST")
    );
  };
  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?page=-1&&donviid=${INFO.donVi_Id}`,
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
        const xuong = [];
        res.data.forEach((x) => {
          if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
            xuong.push(x);
          }
        });
        setListXuong(xuong);
      } else {
        setListXuong([]);
      }
    });
  };

  const onSearchDeNghiMuaHang = () => {
    loadData(keyword, Xuong, FromDate, ToDate, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, Xuong, FromDate, ToDate, page);
    }
  };

  const actionContent = (item) => {
    // const confirmItem =
    //   permission && permission.cof && item.tinhTrang === "Chưa duyệt" ? (
    //     <Link
    //       to={{
    //         pathname: `${match.url}/${item.id}/xac-nhan`,
    //         state: { itemData: item, permission },
    //       }}
    //       title="Xác nhận"
    //       onClick={() => {
    //         dispatch(
    //           setHistory({
    //             path: match.path,
    //             option: {
    //               Xuong,
    //               FromDate,
    //               ToDate,
    //               page,
    //               keyword,
    //             },
    //           })
    //         );
    //       }}
    //     >
    //       <CheckCircleOutlined />
    //     </Link>
    //   ) : (
    //     <span disabled title="Xác nhận">
    //       <CheckCircleOutlined />
    //     </span>
    //   );
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa"
          onClick={() => {
            dispatch(
              setHistory({
                path: match.path,
                option: {
                  Xuong,
                  FromDate,
                  ToDate,
                  page,
                  keyword,
                },
              })
            );
          }}
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {/* {confirmItem}
        <Divider type="vertical" /> */}
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.maPhieuNhapTienDoSanXuat,
      "phiếu xuất Xuong thành phẩm"
    );
  };

  const deleteItemAction = (item) => {
    let url = `lkn_PhieuNhapTienDoSanXuat?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, Xuong, FromDate, ToDate, page);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    loadData(keyword, Xuong, FromDate, ToDate, pagination);
  };

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });

    dispatch(
      setHistory({
        path: match.path,
        option: {
          Xuong,
          FromDate,
          ToDate,
          page,
          keyword,
        },
      })
    );
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Tạo phiếu
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);

  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
          onClick={() => {
            dispatch(
              setHistory({
                path: match.path,
                option: {
                  Xuong,
                  FromDate,
                  ToDate,
                  page,
                  keyword,
                },
              })
            );
          }}
        >
          {val.maPhieuNhapTienDoSanXuat}
        </Link>
      ) : (
        <span disabled>{val.maPhieuNhapTienDoSanXuat}</span>
      );
    return <div>{detail}</div>;
  };

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã phiếu",
      key: "maPhieuNhapTienDoSanXuat",
      align: "center",
      render: (val) => renderDetail(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuNhapTienDoSanXuat,
            value: d.maPhieuNhapTienDoSanXuat,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maPhieuNhapTienDoSanXuat.includes(value),
      filterSearch: true,
    },
    {
      title: "Xưởng sản xuất",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenPhongBan,
            value: d.tenPhongBan,
          };
        })
      ),
      onFilter: (value, record) => record.tenPhongBan.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng sản phẩm",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Ngày nhập",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngay,
            value: d.ngay,
          };
        })
      ),
      onFilter: (value, record) => record.ngay.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày tạo phiếu",
      dataIndex: "ngayTaoPhieu",
      key: "ngayTaoPhieu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayTaoPhieu,
            value: d.ngayTaoPhieu,
          };
        })
      ),
      onFilter: (value, record) => record.ngayTaoPhieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Người lập",
      dataIndex: "tenNguoiTao",
      key: "tenNguoiTao",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiTao,
            value: d.tenNguoiTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiTao.includes(value),
      filterSearch: true,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

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

  const handleOnSelectXuong = (val) => {
    setXuong(val);
    setPage(1);
    loadData(keyword, val, FromDate, ToDate, 1);
  };
  // const handleClearXuong = (val) => {
  //   setXuong("");
  //   setPage(1);
  //   loadData(keyword, "", FromDate, ToDate, 1);
  // };

  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, Xuong, dateString[0], dateString[1], 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Tiến độ sản xuất"
        description="Tiến độ sản xuất"
        buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <h5>Xuỏng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectXuong}
              value={Xuong}
              onChange={(value) => setXuong(value)}
              // allowClear
              // onClear={handleClearXuong}
            />
          </Col>

          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <h5>Ngày:</h5>
            <RangePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(FromDate, "DD/MM/YYYY"),
                moment(ToDate, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>
          <Col xl={6} lg={24} md={24} xs={24}>
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchDeNghiMuaHang,
                onSearch: onSearchDeNghiMuaHang,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
        <Table
          bordered
          scroll={{ x: 700, y: "70vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={(record) => {
            return record.isParent ? "editable-row" : "editable-row";
          }}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default TienDoSanXuat;
