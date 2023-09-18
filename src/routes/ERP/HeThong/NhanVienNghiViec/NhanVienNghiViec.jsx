import { PlusOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import { map, find, remove } from "lodash";
import { Table, Toolbar, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

function NhanVienNghiViec({ history, permission }) {
  const [keyword, setKeyword] = useState("");
  const dispatch = useDispatch();
  const { data, loading, width } = useSelector(({ common }) => common).toJS();
  const [donViSelect, setDonViSelect] = useState([]);
  const [donVi, setDonVi] = useState("");
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    if (permission && permission.view) {
      getListData(donVi, keyword);
      getDonVi();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListData = (donviId, keyword) => {
    let param = convertObjectToUrlParams({ donviId, keyword });
    dispatch(
      fetchStart(
        `Account/Get-List-User-nghi-viec?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  const getDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/get-by-role?page=-1`,
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
          setDonViSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
    getListData(donVi, keyword);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(donVi, val.target.value);
    }
  };

  const dataList = reDataForTable(data);

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
        width: 40,
        align: "center",
        fixed: width > 700 && "left",
      },
      {
        title: "Mã nhân viên",
        dataIndex: "maNhanVien",
        key: "maNhanVien",
        align: "center",
        width: 100,
      },
      {
        title: "Họ tên",
        dataIndex: "fullName",
        key: "fullName",
        align: "center",
        width: 180,
        sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        align: "center",
        width: 230,
      },
      {
        title: "SĐT",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        width: 100,
        align: "center",
      },
      {
        title: "Chức vụ",
        dataIndex: "tenChucVu",
        key: "tenChucVu",
        align: "center",
        filters: removeDuplicates(
          map(data, (d) => {
            return {
              text: d.tenChucVu,
              value: d.tenChucVu,
            };
          })
        ),
        onFilter: (value, record) => record.tenChucVu.includes(value),
        filterSearch: true,
      },
      {
        title: "Bộ phận",
        dataIndex: "tenBoPhan",
        key: "tenBoPhan",
        align: "center",
        filters: removeDuplicates(
          map(data, (d) => {
            return {
              text: d.tenBoPhan,
              value: d.tenBoPhan,
            };
          })
        ),
        onFilter: (value, record) => record.tenBoPhan.includes(value),
        filterSearch: true,
      },
      {
        title: "Phòng ban",
        dataIndex: "tenPhongBan",
        key: "tenPhongBan",
        align: "center",
        filters: removeDuplicates(
          map(data, (d) => {
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
        title: "Đơn vị",
        dataIndex: "tenDonVi",
        key: "tenDonVi",
        align: "center",
        filters: removeDuplicates(
          map(data, (d) => {
            return {
              text: d.tenDonVi,
              value: d.tenDonVi,
            };
          })
        ),
        onFilter: (value, record) => record.tenDonVi.includes(value),
        filterSearch: true,
      },
      {
        title: "Ngày nghỉ việc",
        dataIndex: "ngayNghiViec",
        key: "ngayNghiViec",
        align: "center",
      },
    ];
    return renderHead;
  };
  const handleOnSelectCBNV = (value) => {
    getListData(value, keyword);
  };
  const handleClearCBNV = () => {
    getListData("", keyword);
  };

  /**
   * Chuyển tới trang thêm mới người dùng
   *
   */
  const handleRedirect = () => {
    history.push({
      pathname: `/he-thong/can-bo-nhan-vien/${selectedDevice[0].id}/chinh-sua`,
    });
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
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Kích hoạt CBNV
        </Button>
      </>
    );
  };
  function hanldeRemoveSelected(device) {
    const newDevice = remove(selectedDevice, (d) => {
      return d.key !== device.key;
    });
    const newKeys = remove(selectedKeys, (d) => {
      return d !== device.key;
    });
    setSelectedDevice(newDevice);
    setSelectedKeys(newKeys);
  }
  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedDevice,
    onSelect: (record, selected, selectedRow) => {
      setSelectedDevice([record]);
      setSelectedKeys([record.key]);
    },
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Nhân viên nghỉ việc"
        description="Danh sách nhân viên nghỉ việc"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={2}
            xl={3}
            lg={4}
            md={4}
            sm={5}
            xs={7}
            align={"center"}
            style={{ marginTop: 8 }}
          >
            Đơn vị:
          </Col>
          <Col xl={8} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <Select
              className="heading-select slt-search th-select-heading"
              data={donViSelect ? donViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectCBNV}
              value={donVi}
              onChange={(value) => setDonVi(value)}
              allowClear
              onClear={handleClearCBNV}
              optionFilterProp={"name"}
              showSearch
            />
          </Col>
          <Col xl={6} lg={24} md={24} xs={24}>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchNguoiDung,
                onSearch: onSearchNguoiDung,
                placeholder: "Tìm kiếm",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
        <Table
          bordered
          scroll={{ x: 1200, y: "55vh" }}
          columns={header()}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedKeys,
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (e) => {
                const found = find(selectedKeys, (k) => k === record.key);
                if (found === undefined) {
                  setSelectedDevice([record]);
                  setSelectedKeys([record.key]);
                } else {
                  hanldeRemoveSelected(record);
                }
              },
            };
          }}
        />
      </Card>
    </div>
  );
}
export default NhanVienNghiViec;
