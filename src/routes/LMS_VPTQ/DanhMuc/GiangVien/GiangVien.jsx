import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Image, Row } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function GiangVien({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListDonViDaoTao, setListDonViDaoTao] = useState([]);
  const [DonViDaoTao, setDonViDaoTao] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getListDonViDaoTao();
      getListData(DonViDaoTao, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (vptq_lms_DonViDaoTao_Id, keyword, page) => {
    let param = convertObjectToUrlParams({
      vptq_lms_DonViDaoTao_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_GiangVien?${param}`,
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
        setData(res.data);
      } else {
        setData([]);
      }
    });
  };

  const getListDonViDaoTao = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DonViDaoTao?page=-1`,
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
          setListDonViDaoTao(res.data);
        } else {
          setListDonViDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(DonViDaoTao, keyword, pagination);
  };

  const onSearchGiangVien = () => {
    getListData(DonViDaoTao, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(DonViDaoTao, val.target.value, page);
    }
  };

  const deleteItemFunc = (item) => {
    const title = "giảng viên";
    ModalDeleteConfirm(deleteItemAction, item, item.tenGiangVien, title);
  };

  const deleteItemAction = (item) => {
    let url = `vptq_lms_GiangVien/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(DonViDaoTao, keyword, page);
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item, permission },
          }}
          title="Sửa"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );

    const deleteItemVal =
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const { totalRow } = Data;
  let dataList = reDataForTable(Data.datalist);

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 150,
      render: (value, record) => {
        return (
          value && (
            <span>
              <Image
                src={BASE_URL_API + value}
                alt="Hình ảnh giảng viên"
                style={{ maxWidth: 70, maxHeight: 70 }}
              />
            </span>
          )
        );
      },
    },
    {
      title: "Mã giảng viên",
      dataIndex: "maGiangVien",
      key: "maGiangVien",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maGiangVien,
            value: d.maGiangVien,
          };
        })
      ),
      onFilter: (value, record) => record.maGiangVien.includes(value),
      filterSearch: true,
    },
    {
      title: "Họ và tên",
      dataIndex: "tenGiangVien",
      key: "tenGiangVien",
      align: "left",
      width: 180,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenGiangVien,
            value: d.tenGiangVien,
          };
        })
      ),
      onFilter: (value, record) => record.tenGiangVien.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị đào tạo",
      dataIndex: "tenDonViDaoTao",
      key: "tenDonViDaoTao",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonViDaoTao,
            value: d.tenDonViDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Giới thiệu",
      dataIndex: "gioiThieu",
      key: "gioiThieu",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.gioiThieu,
            value: d.gioiThieu,
          };
        })
      ),
      onFilter: (value, record) => record.gioiThieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Loại giảng viên",
      dataIndex: "tenLoaiGiangVien",
      key: "tenLoaiGiangVien",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLoaiGiangVien,
            value: d.tenLoaiGiangVien,
          };
        })
      ),
      onFilter: (value, record) => record.tenLoaiGiangVien.includes(value),
      filterSearch: true,
    },
    {
      title: "Chuyên môn",
      dataIndex: "tenChuyenMon",
      key: "tenChuyenMon",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenChuyenMon,
            value: d.tenChuyenMon,
          };
        })
      ),
      onFilter: (value, record) => record.tenChuyenMon.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 150,
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

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  const handleOnSelectDonViDaoTao = (value) => {
    setDonViDaoTao(value);
    getListData(value, keyword, page);
  };

  const handleClearDonViDaoTao = () => {
    setDonViDaoTao(null);
    getListData(null, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục giảng viên"}
        description="Danh sách giảng viên"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
        <Row>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Đơn vị:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonViDaoTao ? ListDonViDaoTao : []}
              placeholder="Chọn đơn vị đào tạo"
              optionsvalue={["id", "tenDonViDaoTao"]}
              style={{ width: "100%" }}
              value={DonViDaoTao}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectDonViDaoTao}
              allowClear
              onClear={handleClearDonViDaoTao}
            />
          </Col>
          <Col
            xxl={5}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchGiangVien,
                onSearch: onSearchGiangVien,
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
          columns={columns}
          scroll={{ x: 1000, y: "50vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize: 20,
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

export default GiangVien;
