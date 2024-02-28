import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import { Table, EditableTableRow } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  exportExcel,
  getMonthYearNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { DownloadOutlined } from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoKetQuaChuyenDeDaoTaoTheoThang({ history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataBaoCao, setDataBaoCao] = useState([]);
  const [ThangNam, setThangNam] = useState(getMonthYearNow());

  useEffect(() => {
    if (permission && permission.view) {
      getListData(ThangNam);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (thangnam) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      thang: thangnam.slice(0, 2),
      nam: thangnam.slice(3),
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/bao-cao-ket-qua-chuyen-de-dao-tao-theo-thang?${param}`,
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
        if (res && res.status !== 409) {
          const data = res.data && res.data;
          setDataBaoCao(data);
        } else {
          setDataBaoCao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const dataList = reDataForTable(DataBaoCao);

  const tongSLDangKy = dataList.reduce((sum, item) => {
    return sum + (item.soLuongDangKy || 0);
  }, 0);

  const tongSLThamDu = dataList.reduce((sum, item) => {
    return sum + (item.soLuongThamDu || 0);
  }, 0);

  const tyLeThamDu = parseFloat(
    ((tongSLThamDu / tongSLDangKy) * 100).toFixed(2)
  );

  const tongSLVangCoPhep = dataList.reduce((sum, item) => {
    return sum + (item.soLuongVangCoPhep || 0);
  }, 0);

  const tongSLVangKhongPhep = dataList.reduce((sum, item) => {
    return sum + (item.soLuongVangKhongPhep || 0);
  }, 0);

  const tongSLDat = dataList.reduce((sum, item) => {
    return sum + (item.soLuongDat || 0);
  }, 0);

  const tongSLKhongDat = dataList.reduce((sum, item) => {
    return sum + (item.soLuongKhongDat || 0);
  }, 0);

  const tongTyLeDat = parseFloat(((tongSLDat / tongSLDangKy) * 100).toFixed(2));

  const tongTyLeKhongDat = parseFloat(
    ((tongSLKhongDat / tongSLDangKy) * 100).toFixed(2)
  );

  const HangTong = {
    key: "Tổng",
    soLuongThamDu: tongSLThamDu,
    soLuongDangKy: tongSLDangKy,
    tyLeThamDu: tyLeThamDu,
    soLuongVangCoPhep: tongSLVangCoPhep,
    soLuongVangKhongPhep: tongSLVangKhongPhep,
    soLuongDat: tongSLDat,
    tyLeDat: tongTyLeDat,
    soLuongKhongDat: tongSLKhongDat,
    tyLeKhongDat: tongTyLeKhongDat,
  };
  dataList.length && dataList.push(HangTong);

  let columnValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 2 : 1,
      }),
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 250,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          đăng ký
        </div>
      ),
      dataIndex: "soLuongDangKy",
      key: "soLuongDangKy",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{value} học viên</span>;
      },
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tham dự
        </div>
      ),
      dataIndex: "soLuongThamDu",
      key: "soLuongThamDu",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{value} học viên</span>;
      },
    },
    {
      title: (
        <div>
          Tỷ lệ
          <br />
          tham dự
        </div>
      ),
      dataIndex: "tyLeThamDu",
      key: "tyLeThamDu",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{value} %</span>;
      },
    },
    {
      title: "Chuyên cần",
      align: "center",
      children: [
        {
          title: (
            <div>
              Vắng
              <br />
              (Có phép)
            </div>
          ),
          dataIndex: "soLuongVangCoPhep",
          key: "soLuongVangCoPhep",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} học viên</span>;
          },
        },
        {
          title: (
            <div>
              Vắng
              <br />
              (Không phép)
            </div>
          ),
          dataIndex: "soLuongVangKhongPhep",
          key: "soLuongVangKhongPhep",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} học viên</span>;
          },
        },
      ],
    },
    {
      title: "Kết quả",
      align: "center",
      children: [
        {
          title: "Đạt",
          dataIndex: "soLuongDat",
          key: "soLuongDat",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} học viên</span>;
          },
        },
        {
          title: "Tỷ lệ",
          dataIndex: "tyLeDat",
          key: "tyLeDat",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} %</span>;
          },
        },
        {
          title: "Không đạt",
          dataIndex: "soLuongKhongDat",
          key: "soLuongKhongDat",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} học viên</span>;
          },
        },
        {
          title: "Tỷ lệ",
          dataIndex: "tyLeKhongDat",
          key: "tyLeKhongDat",
          align: "center",
          width: 100,
          render: (value) => {
            return <span>{value} %</span>;
          },
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

  const columns = map(columnValues, (col) => {
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

  const handleXuatExcel = () => {
    const DataXuatExcel = {
      thang: ThangNam.slice(0, 2),
      nam: ThangNam.slice(3),
      list_ChiTiets: DataBaoCao,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/export-bao-cao-ket-qua-chuyen-de-dao-tao-theo-thang`,
          "POST",
          DataXuatExcel,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        exportExcel(
          "BAO_CAO_KET_QUA_CHUYEN_DE_DAO_TAO_THEO_THANG",
          res.data.dataexcel
        );
      }
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
          disabled={DataBaoCao && DataBaoCao.length === 0}
        >
          Xuất Excel
        </Button>
      </>
    );
  };

  const handleChangeMonth = (month) => {
    setThangNam(month);
    getListData(month);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo kết quả chuyên đề đào tạo theo tháng"
        description="Báo cáo kết quả chuyên đề đào tạo theo tháng"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={8}
            xl={12}
            lg={16}
            md={16}
            sm={20}
            xs={24}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0px 20px",
            }}
          >
            <span
              style={{
                width: "60px",
              }}
            >
              Tháng:
            </span>
            <DatePicker
              format={"MM/YYYY"}
              picker="month"
              onChange={(date, month) => handleChangeMonth(month)}
              defaultValue={moment(ThangNam, "MM/YYYY")}
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1300, y: "55vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={(record) =>
            record.key === "Tổng" ? "total-row" : "editable-row"
          }
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default BaoCaoKetQuaChuyenDeDaoTaoTheoThang;
