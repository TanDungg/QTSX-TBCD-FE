import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map, isEmpty } from "lodash";
import {
  Table,
  EditableTableRow,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function TheoDoiHangVe({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());

  useEffect(() => {
    if (permission && permission.view) {
      loadData(keyword, FromDate, ToDate, page);
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
  const loadData = (keyword, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      tuNgay,
      denNgay,
      page,
    });
    dispatch(
      fetchStart(
        `tits_qtsx_PhieuNhanHang/theo-doi-hang-ve?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchDeNghiMuaHang = () => {
    loadData(keyword, FromDate, ToDate, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, FromDate, ToDate, page);
    }
  };

  const renderColumn = (value, key) => {
    if (key === "ngayNhan") {
      return (
        <div>
          {value &&
            value.map((nn) => {
              return (
                <Tag
                  style={{
                    color: "#0469B9",
                    fontSize: 13,
                  }}
                >
                  {nn.ngay} (SL: {nn.soLuong})
                </Tag>
              );
            })}
        </div>
      );
    }
    if (key === "ketQua") {
      return (
        <div>
          {value && (
            <Tag
              style={{
                color:
                  value === "Chưa nhận hàng"
                    ? "red"
                    : value === "Đang giao hàng"
                    ? "orange"
                    : "blue",
                fontSize: 13,
              }}
            >
              {value}
            </Tag>
          )}
        </div>
      );
    }
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      fixed: "left",
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      width: 130,
      fixed: "left",
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      width: 180,
      fixed: "left",
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Loại vật tư",
      dataIndex: "tenLoaiVatTu",
      key: "tenLoaiVatTu",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.tenLoaiVatTu,
            value: d.tenLoaiVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenLoaiVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "ĐVT",
      dataIndex: "donViTinh",
      key: "donViTinh",
      align: "center",
      width: 80,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.donViTinh,
            value: d.donViTinh,
          };
        })
      ),
      onFilter: (value, record) => record.donViTinh.includes(value),
      filterSearch: true,
    },
    {
      title: "CV thu mua",
      dataIndex: "tenChuyenVienThuMua",
      key: "tenChuyenVienThuMua",
      align: "center",
      width: 180,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.tenChuyenVienThuMua,
            value: d.tenChuyenVienThuMua,
          };
        })
      ),
      onFilter: (value, record) => record.tenChuyenVienThuMua.includes(value),
      filterSearch: true,
    },
    {
      title: "SL mua",
      dataIndex: "soLuongMua",
      key: "soLuongMua",
      align: "center",
      width: 80,
    },
    {
      title: "Đơn hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.maPhieu,
            value: d.maPhieu,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày dự kiến giao",
      dataIndex: "ngayGiaoDuKien",
      key: "ngayGiaoDuKien",
      align: "center",
      width: 140,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.ngayGiaoDuKien,
            value: d.ngayGiaoDuKien,
          };
        })
      ),
      onFilter: (value, record) => record.ngayGiaoDuKien.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày nhận hàng",
      dataIndex: "ngayNhan",
      key: "ngayNhan",
      align: "center",
      width: 160,
      render: (value) => renderColumn(value, "ngayNhan"),
    },
    {
      title: "SL nhận",
      dataIndex: "tongSoLuongNhan",
      key: "tongSoLuongNhan",
      align: "center",
      width: 80,
    },
    {
      title: "SL thiếu",
      dataIndex: "soLuongThieu",
      key: "soLuongThieu",
      align: "center",
      width: 80,
    },
    {
      title: "SL dư",
      dataIndex: "soLuongDu",
      key: "soLuongDu",
      align: "center",
      width: 80,
    },
    {
      title: "Kết quả",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
      width: 140,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.ketQua,
            value: d.ketQua,
          };
        })
      ),
      onFilter: (value, record) => record.ketQua.includes(value),
      filterSearch: true,
      render: (value) => (
        <div>
          {value && (
            <Tag
              color={
                value === "Đang giao hàng"
                  ? "orange"
                  : value === "Hoàn thành"
                  ? "blue"
                  : "red"
              }
              style={{
                fontSize: 13,
              }}
            >
              {value}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      width: 130,
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

  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, dateString[0], dateString[1], 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Theo dõi hàng về"
        description="Theo dõi hàng về"
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
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
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
      </Card>
      <Card className="th-card-margin-bottom">
        <Table
          bordered
          scroll={{ x: 1720, y: "55vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(data)}
          size="small"
          rowClassName={(record) => {
            return record.isParent ? "editable-row" : "editable-row";
          }}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default TheoDoiHangVe;
