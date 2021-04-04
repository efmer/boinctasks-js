/*
    BoincTasks Js to show and control one or multiple BOINC clients.
    Copyright (C) 2021-now  eFMer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const Logging = require('../functions/logging');
const logging = new Logging();
const SendArray = require('./send_array');

class BoincBenchmark{
    run(type, gb)
    {
      runBenchmark(gb)
    }
  }
  module.exports = BoincBenchmark;

function runBenchmark(gb)
{
  try {
    for (let i=0;i< connections.length;i++)
    {
      let con = connections[i];
      if (con.check == '1')
      {
        if (con.sidebar)
        {
          if (con.auth)
          {
            const sendArray = new SendArray();      
            let send = "<run_benchmarks/>";
            sendArray.send(gb.connections[i],send, dataReady);
          }
        }
      }
    }  
  } catch (error) {
    logging.logError('BoincBenchmark,runBenchmark', error);  
  }
}

function dataReady(data)
{
  let result = this.client_completeData;
  if (result.indexOf("<success") < 0)
  {
    logging.logErrorMsg("Benchmark: ".this.computerName,this.client_completeData)
  }
}