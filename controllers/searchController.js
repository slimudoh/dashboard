const db = require("../util/database");
const async = require("async");

exports.search = (req, res) => {
  const return_data = {};

  async.parallel(
    [
      function(parallel_done) {
        db.query("SELECT * FROM company")
          .then(([rows, fieldData]) => {
            return_data.company = rows;
            parallel_done();
          })
          .catch(err => {
            console.log(err);
          });
      },
      function(parallel_done) {
        db.query("SELECT * FROM employee")
          .then(([rows, fieldData]) => {
            return_data.employee = rows;
            parallel_done();
          })
          .catch(err => {
            console.log(err);
          });
      },
      function(parallel_done) {
        db.query("SELECT * FROM manager")
          .then(([rows, fieldData]) => {
            return_data.manager = rows;
            parallel_done();
          })
          .catch(err => {
            console.log(err);
          });
      },
      function(parallel_done) {
        db.query("SELECT * FROM subscription")
          .then(([rows, fieldData]) => {
            return_data.subscription = rows;
            parallel_done();
          })
          .catch(err => {
            console.log(err);
          });
      },
      function(parallel_done) {
        db.query("SELECT * FROM employee_history")
          .then(([rows, fieldData]) => {
            return_data.history = rows;
            parallel_done();
          })
          .catch(err => {
            console.log(err);
          });
      },
      function(parallel_done) {
        db.query("SELECT * FROM field_data")
          .then(([rows, fieldData]) => {
            return_data.field_data = rows;
            parallel_done();
          })
          .catch(err => {
            console.log(err);
          });
      }
    ],
    function(err) {
      if (err) {
        console.log(err);
        return;
      }

      const date = new Date();
      const firstDateOfWeek = new Date(
        date.setDate(date.getDate() - date.getDay())
      );
      const lastDateOfWeek = new Date(
        date.setDate(date.getDate() - date.getDay() + 6)
      );

      const firstDateOfWeekDate = new Date(firstDateOfWeek).getDate();
      const firstDateOfWeekMonth = new Date(firstDateOfWeek).getMonth();
      const firstDateOfWeekYear = new Date(firstDateOfWeek).getFullYear();

      const lastDateOfWeekDate = new Date(lastDateOfWeek).getDate();
      const lastDateOfWeekMonth = new Date(lastDateOfWeek).getMonth();
      const lastDateOfWeekYear = new Date(lastDateOfWeek).getFullYear();

      const firstWeekDate = new Date(
        firstDateOfWeekYear,
        firstDateOfWeekMonth,
        firstDateOfWeekDate
      );
      const lastWeekDate = new Date(
        lastDateOfWeekYear,
        lastDateOfWeekMonth,
        lastDateOfWeekDate
      );

      const newCompany = [];

      for (let i in return_data.company) {
        newCompany.push({
          company_table_id: return_data.company[i].id,
          email: return_data.company[i].email,
          company_name: return_data.company[i].company_name,
          company_id: return_data.company[i].company_code,
          number_of_employees: 0,
          amount: 0,
          created_date: new Date(
            return_data.company[i].created_on
          ).toUTCString(),
          subscription_date: new Date(
            return_data.company[i].last_subscription
          ).toUTCString(),
          last_updated: "Empty", //new Date(return_data.company[i].last_subscription).toUTCString(),
          employee_login: "Not Captured",
          status: "inactive"
        });
      }

      const activeCompanies = [];

      for (let i in return_data.company) {
        const companyCode = return_data.company[i].company_code;

        for (let i in return_data.field_data) {
          const employeeCode = return_data.field_data[i].manager_code;
          if (companyCode.trim() === employeeCode.trim()) {
            const sub = return_data.field_data[i].created_on;
            // const sub = "2019-3-8";
            const subDate = new Date(sub).getDate();
            const subMonth = new Date(sub).getMonth();
            const subYear = new Date(sub).getFullYear();
            const subDay = new Date(subYear, subMonth, subDate);

            if (subDay > firstWeekDate && subDay < lastWeekDate) {
              activeCompanies.push({
                companyCode: companyCode,
                companyStatus: "Active"
              });
            }
          }
        }
      }

      for (let j of newCompany) {
        for (let i of activeCompanies) {
          if (j.company_id === i.companyCode) {
            j.status = i.companyStatus;
          }
        }
      }

      for (let i in return_data.employee) {
        const lastUpdated = return_data.employee[i].last_modified_date;
        const lastUpdatedDate = new Date(lastUpdated).getDate();
        const lastUpdatedMonth = new Date(lastUpdated).getMonth();
        const lastUpdatedYear = new Date(lastUpdated).getFullYear();

        const employeeCode = return_data.employee[i].employee_id;
        for (let j of newCompany) {
          const companyCode = j.company_id;
          if (employeeCode.indexOf(companyCode) !== -1) {
            j.number_of_employees++;

            const newCoyUpdated = j.last_updated;
            const newCoyDate = new Date(newCoyUpdated).getDate();
            const newCoyMonth = new Date(newCoyUpdated).getMonth();
            const newCoyYear = new Date(newCoyUpdated).getFullYear();

            const newDate = new Date(
              lastUpdatedYear,
              lastUpdatedMonth,
              lastUpdatedDate
            );
            const oldDate = new Date(newCoyYear, newCoyMonth, newCoyDate);

            if (newDate > oldDate) {
              j.last_updated = new Date(
                return_data.employee[i].last_modified_date
              ).toUTCString();
            }
          }
        }
      }

      for (let i in return_data.subscription) {
        const subCompanyID = return_data.subscription[i].company_id;
        for (let j of newCompany) {
          const companyTableId = j.company_table_id;
          if (subCompanyID === companyTableId) {
            j.amount = return_data.subscription[i].amount;
          }
        }
      }

      let active = [];
      let inactive = [];

      for (let j of newCompany) {
        if (j.status.toLowerCase() === "active") {
          active.push("active");
        }

        if (j.status.toLowerCase() === "inactive") {
          inactive.push("inactive");
        }
      }

      const searchResult = [];

      if (req.body.coyname) {
        const searchRes = req.body.coyname.trim();

        for (let i of newCompany) {
          const comp = i.company_name.split(" ");

          for (let j of comp) {
            if (j.toLowerCase() === searchRes.toLowerCase()) {
              searchResult.push({
                company_table_id: i.company_table_id,
                email: i.email,
                phone: i.phone,
                company_name: i.company_name,
                company_id: i.company_id,
                number_of_employees: i.number_of_employees,
                amount: i.amount,
                created_date: i.created_date,
                subscription_date: i.subscription_date,
                last_updated: i.last_updated,
                employee_login: i.employee_login,
                status: i.status
              });
            }
          }
        }

        for (let i of newCompany) {
          if (i.company_id.toLowerCase() === searchRes.toLowerCase()) {
            searchResult.push({
              company_table_id: i.company_table_id,
              email: i.email,
              phone: i.phone,
              company_name: i.company_name,
              company_id: i.company_id,
              number_of_employees: i.number_of_employees,
              amount: i.amount,
              created_date: i.created_date,
              subscription_date: i.subscription_date,
              last_updated: i.last_updated,
              employee_login: i.employee_login,
              status: i.status
            });
          }

          if (i.email.toLowerCase() === searchRes.toLowerCase()) {
            searchResult.push({
              company_table_id: i.company_table_id,
              email: i.email,
              phone: i.phone,
              company_name: i.company_name,
              company_id: i.company_id,
              number_of_employees: i.number_of_employees,
              amount: i.amount,
              created_date: i.created_date,
              subscription_date: i.subscription_date,
              last_updated: i.last_updated,
              employee_login: i.employee_login,
              status: i.status
            });
          }

          if (i.phone === searchRes.toLowerCase()) {
            searchResult.push({
              company_table_id: i.company_table_id,
              email: i.email,
              phone: i.phone,
              company_name: i.company_name,
              company_id: i.company_id,
              number_of_employees: i.number_of_employees,
              amount: i.amount,
              created_date: i.created_date,
              subscription_date: i.subscription_date,
              last_updated: i.last_updated,
              employee_login: i.employee_login,
              status: i.status
            });
          }
        }

        let page;
        if (!req.params.page || req.params.page == 1) {
          page = 0;
        } else {
          page = req.params.page - 1;
        }

        const numPerPage = 50;
        const pages = Math.ceil(searchResult.length / numPerPage);
        const startCount = page * numPerPage;
        const pageCount = startCount + numPerPage;

        return res.render("search", {
          page: "search",
          index: startCount + 1,
          employees: return_data.employee.length,
          companies: newCompany.length,
          active: active.length,
          inactive: inactive.length,
          results: searchResult.slice(startCount, pageCount),
          pages: pages,
          position: req.params.page || 1,
          search: "result for '" + req.body.coyname + "'"
        });
      }

      //search date
      if (req.body.startdate) {
        // start date
        const startDate = new Date(req.body.startdate).getDate();
        const startMonth = new Date(req.body.startdate).getMonth();
        const startYear = new Date(req.body.startdate).getFullYear();

        // end date
        const endDate = new Date(req.body.enddate).getDate();
        const endMonth = new Date(req.body.enddate).getMonth();
        const endYear = new Date(req.body.enddate).getFullYear();

        for (let i of newCompany) {
          const subDate = new Date(i.subscription_date).getDate();
          const subMonth = new Date(i.subscription_date).getMonth();
          const subYear = new Date(i.subscription_date).getFullYear();

          start = new Date(startYear, startMonth, startDate);
          end = new Date(endYear, endMonth, endDate);
          sub = new Date(subYear, subMonth, subDate);

          if (sub >= start && sub <= end) {
            searchResult.push({
              company_table_id: i.company_table_id,
              email: i.email,
              phone: i.phone,
              company_name: i.company_name,
              company_id: i.company_id,
              number_of_employees: i.number_of_employees,
              amount: i.amount,
              created_date: i.created_date,
              subscription_date: i.subscription_date,
              last_updated: i.last_updated,
              employee_login: i.employee_login,
              status: i.status
            });
          }
        }

        let page;
        if (!req.params.page || req.params.page == 1) {
          page = 0;
        } else {
          page = req.params.page - 1;
        }

        const numPerPage = 50;
        const pages = Math.ceil(searchResult.length / numPerPage);
        const startCount = page * numPerPage;
        const pageCount = startCount + numPerPage;

        return res.render("search", {
          page: "seach",
          index: startCount + 1,
          employees: return_data.employee.length,
          companies: newCompany.length,
          active: active.length,
          inactive: inactive.length,
          results: searchResult.slice(startCount, pageCount),
          pages: pages,
          position: req.params.page || 1,
          search:
            "result for dates '" +
            req.body.startdate +
            " to " +
            req.body.enddate +
            "'"
        });
      }
    }
  );
};
