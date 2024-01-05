import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty, map } from "lodash";
import {
  Table,
  EditableTableRow,
  Select,
  Toolbar,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  getDateNow,
  getMonthYearNow,
  exportExcel,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DownloadOutlined } from "@ant-design/icons";
const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoSanXuatNgay({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [Xuong, setXuong] = useState(null);
  const [Data, setData] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [keyword, setKeyword] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getXuong();
      getListData(Xuong, keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (tits_qtsx_Xuong_Id, keyword) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id,
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/bao-cao-san-xuat-ngay?${param}`,
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
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?page=-1`,
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
          setListXuong(res.data);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maSanPham,
            value: d.maSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maSanPham && record.maSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenSanPham && record.tenSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenDonViTinh,
            value: d.tenDonViTinh,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenDonViTinh && record.tenDonViTinh.includes(value),
      filterSearch: true,
    },
    {
      title: `Kết quả sản xuất ngày ${getDateNow()}`,
      children: [
        {
          title: "KH",
          dataIndex: `keHoach`,
          key: `keHoach`,
          align: "center",
        },
        {
          title: "TH",
          dataIndex: `thucHien`,
          key: `thucHien`,
          align: "center",
        },
        {
          title: "Tỉ lệ",
          dataIndex: `phanTram`,
          key: `phanTram`,
          align: "center",
          render: (val) => <span>{val}%</span>,
        },
      ],
    },
    {
      title: `Kết quả sản xuất tháng ${getMonthYearNow()}`,
      children: [
        {
          title: "KH",
          dataIndex: `luyKeKeHoach`,
          key: `luyKeKeHoach`,
          align: "center",
        },
        {
          title: "TH",
          dataIndex: `luyKeThucHien`,
          key: `luyKeThucHien`,
          align: "center",
        },
        {
          title: "Tỉ lệ",
          dataIndex: `luyKePhanTram`,
          key: `luyKePhanTram`,
          align: "center",
          render: (val) => <span>{val}%</span>,
        },
        {
          title: "Còn lại",
          dataIndex: `conLai`,
          key: `conLai`,
          align: "center",
        },
        {
          title: "KHSX ngày tiếp theo",
          dataIndex: `keHoachNgayMai`,
          key: `keHoachNgayMai`,
          align: "center",
          width: 100,
        },
      ],
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

  const handleOnSelectXuong = (value) => {
    if (Xuong !== value) {
      setXuong(value);
      getListData(value, keyword);
    }
  };

  const handleClearXuong = () => {
    setXuong(null);
    getListData(null, keyword);
  };
  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearch = () => {
    getListData(Xuong, keyword);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(Xuong, val.target.value);
    }
  };
  const handleXuatExcel = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/export-file-bao-cao-san-xuat-ngay`,
          "POST",
          Data,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("BaoCaoSanXuatNgay", res.data.dataexcel);
    });
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleXuatExcel}
        >
          Xuất Excel
        </Button>
      </>
    );
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo sản xuất ngày"
        description="Báo cáo sản xuất ngày"
        buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenXuong"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectXuong}
              allowClear
              onClear={handleClearXuong}
              value={Xuong}
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
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearch,
                onSearch: onSearch,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1000, y: "56vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={(record) => {
            "editable-row";
          }}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default BaoCaoSanXuatNgay;
