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
  const [ListNhomVatTu, setListNhomVatTu] = useState([]);
  const [NhomVatTu, setNhomVatTu] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getNhomVatTu();
      loadData(keyword, NhomVatTu, FromDate, ToDate, page);
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
  const loadData = (keyword, nhomVatTu_Id, tuNgay, denNgay, page, vatTu_Id) => {
    const param = convertObjectToUrlParams({
      vatTu_Id,
      tuNgay,
      denNgay,
      keyword,
      nhomVatTu_Id,
      page,
    });
    dispatch(
      fetchStart(
        `lkn_PhieuNhanHang/list-thong-tin-hang-ve?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };
  const getNhomVatTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `NhomVatTu?page=-1&&donviid=${INFO.donVi_Id}`,
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
          setListNhomVatTu(res.data);
        } else {
          setListNhomVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchDeNghiMuaHang = () => {
    loadData(keyword, NhomVatTu, FromDate, ToDate, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, NhomVatTu, FromDate, ToDate, page);
    }
  };

  const renderColumn = (record, value) => {
    if (value === "ngayHangVe") {
      return (
        <div>
          {record.ngayHangVe !== "Chưa xác định" ? (
            JSON.parse(record.ngayHangVe).map((nhv) => {
              return (
                <Tag
                  style={{
                    marginRight: 5,
                    color: "#0469B9",
                    fontSize: 13,
                  }}
                >
                  {nhv.ngayHangVe}
                </Tag>
              );
            })
          ) : (
            <Tag
              style={{
                marginRight: 5,
                color: "red",
                fontSize: 13,
              }}
            >
              {record.ngayHangVe}
            </Tag>
          )}
        </div>
      );
    }
    if (value === "userThuMua") {
      return (
        <div>
          {record.userThuMua !== null ? (
            <Tag
              style={{
                marginRight: 5,
                color: "#0469B9",
                fontSize: 13,
              }}
            >
              {record.userThuMua}
            </Tag>
          ) : (
            <Tag
              style={{
                marginRight: 5,
                color: "red",
                fontSize: 13,
              }}
            >
              Chưa xác định
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
      title: "Nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.tenNhomVatTu,
            value: d.tenNhomVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenNhomVatTu.includes(value),
      filterSearch: true,
    },

    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.hangMucSuDung,
            value: d.hangMucSuDung,
          };
        })
      ),
      onFilter: (value, record) => record.hangMucSuDung.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày dự kiến hoàn thành",
      dataIndex: "ngayHoanThanhDuKien",
      key: "ngayHoanThanhDuKien",
      align: "center",
      width: 140,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.ngayHoanThanhDuKien,
            value: d.ngayHoanThanhDuKien,
          };
        })
      ),
      onFilter: (value, record) => record.ngayHoanThanhDuKien.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày xác nhận hàng về",
      dataIndex: "ngayXacNhanHangVe",
      key: "ngayXacNhanHangVe",
      align: "center",
      width: 140,
    },
    {
      title: "CV Thu mua",
      key: "userThuMua",
      align: "center",
      width: 180,
      render: (record) => renderColumn(record, "userThuMua"),
    },
    {
      title: "Ngày nhận hàng",
      key: "ngayHangVe",
      align: "center",
      width: 140,
      render: (record) => renderColumn(record, "ngayHangVe"),
    },
    {
      title: "ĐVT",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 80,
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.tenDonViTinh,
            value: d.tenDonViTinh,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViTinh.includes(value),
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
      title: "SL hàng nhận",
      dataIndex: "soLuongNhan",
      key: "soLuongNhan",
      align: "center",
      width: 80,
    },
    {
      title: "SL còn thiếu",
      dataIndex: "soLuongConThieu",
      key: "soLuongConThieu",
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
      width: 100,
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
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      width: 100,
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

  const handleOnSelectNhomVatTu = (val) => {
    setNhomVatTu(val);
    setPage(1);
    loadData(keyword, val, FromDate, ToDate, 1);
  };
  const handleClearNhomVatTu = (val) => {
    setNhomVatTu("");
    setPage(1);
    loadData(keyword, "", FromDate, ToDate, 1);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, NhomVatTu, dateString[0], dateString[1], 1);
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
            <h5>Nhóm vật tư:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNhomVatTu ? ListNhomVatTu : []}
              placeholder="Chọn nhóm vật tư"
              optionsvalue={["id", "tenNhomVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectNhomVatTu}
              value={NhomVatTu}
              onChange={(value) => setNhomVatTu(value)}
              allowClear
              onClear={handleClearNhomVatTu}
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
        <Table
          bordered
          scroll={{ x: 1200, y: "55vh" }}
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
