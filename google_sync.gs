/**
 * Google Sheets to Supabase Sync
 * Updated: 2026-01-22 (Final Robust Version for Raw Materials)
 */

var SUPABASE_URL = 'https://qfvmqotkhjkewdwzibyb.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c'; 

var SHEET_CONFIG = {
  '완제품': 'finished_goods',
  '원료': 'raw_materials',
  'finished_goods': 'finished_goods',
  'raw_materials': 'raw_materials'
};

var HEADER_MAP = {
  // 공통
  '제품명': 'product_name', '품명': 'product_name', '이름': 'product_name',
  '규격': 'spec',
  '원산지': 'origin_country', '국가': 'origin_country',
  '메모': 'memo', '비고': 'memo',
  '썸네일': 'thumbnail_url', '이미지': 'thumbnail_url',
  '상세이미지': 'detail_image_url', '연출사진': 'detail_image_url',
  '태그': 'tags', '키워드': 'tags',
  
  // 원재료 (키워드 매칭은 아래 로직에서 처리하지만 맵에도 추가)
  '원재료': 'ingredients', '전성분': 'ingredients', 'Ingredients': 'ingredients', '함량': 'ingredients',
  '원재료명': 'ingredients', '배합비율': 'ingredients', '배합비율(%)': 'ingredients', '원료및함량': 'ingredients',
  '원재료및함량': 'ingredients', '원재료 및 함량': 'ingredients', '원재료 및 배합비율': 'ingredients',
  '원재료정보': 'ingredients', '원재료 정보': 'ingredients',

  // 가격
  '공급가': 'wholesale_a', '공급단가': 'wholesale_a', '도매가A': 'wholesale_a', '도매가 A': 'wholesale_a', '도매가(A)': 'wholesale_a',
  '도매가B': 'wholesale_b', '도매가 B': 'wholesale_b', '도매가(B)': 'wholesale_b',
  '도매가C': 'wholesale_c', '도매가 C': 'wholesale_c', '도매가(C)': 'wholesale_c',
  '소비자가': 'retail_price', '할인가': 'retail_price', '소비자가격': 'retail_price',
  '온라인가': 'online_price', '온라인판매가': 'online_price', '판매가': 'online_price', '온라인 판매가': 'online_price', '온라인가격': 'online_price',
  // 원가는 테이블별로 처리 (finished_goods -> cost_blind, raw_materials -> cost_price)
  '원가': 'cost_blind', 'Cost': 'cost_blind',

  // 날짜
  '입고일': 'inbound_date', '입고일자': 'inbound_date',
  '유효기간': 'expiry_date', '유통기한': 'expiry_date', '소비기한': 'expiry_date', '유통만료일': 'expiry_date',

  // 재고 및 정렬
  '재고상태': 'stock_status', '상태': 'stock_status', '재고': 'stock_status',
  '순서': 'sort_order', '정렬': 'sort_order', '노출순서': 'sort_order', 'No': 'sort_order', 'No.': 'sort_order', '번호': 'sort_order',

  // 물류 스펙 (한글 명칭 완벽 대응)
  '바코드': 'logistics_barcode', 'Barcode': 'logistics_barcode',
  '단위중량': 'product_weight_g', '제품중량': 'product_weight_g', '중량(g)': 'product_weight_g',
  '카톤중량': 'carton_weight_kg', '박스중량': 'carton_weight_kg', '카톤중량(kg)': 'carton_weight_kg',
  
  '박스가로': 'carton_width_mm', '카톤가로': 'carton_width_mm', '카톤,가로': 'carton_width_mm',
  '박스세로': 'carton_depth_mm', '카톤세로': 'carton_depth_mm', '카톤,세로': 'carton_depth_mm',
  '박스높이': 'carton_height_mm', '카톤높이': 'carton_height_mm', '카톤,높이': 'carton_height_mm',

  // 제품 크기
  '제품가로': 'product_width_mm', '단품가로': 'product_width_mm', '가로': 'product_width_mm', '제품 가로': 'product_width_mm',
  '제품세로': 'product_depth_mm', '단품세로': 'product_depth_mm', '세로': 'product_depth_mm', '폭': 'product_depth_mm', '제품 세로': 'product_depth_mm',
  '제품높이': 'product_height_mm', '단품높이': 'product_height_mm', '높이': 'product_height_mm', '제품 높이': 'product_height_mm',

  '입수': 'units_per_carton', '카톤입수': 'units_per_carton', '박스입수': 'units_per_carton', '입수량': 'units_per_carton',
  '팔레트적재': 'cartons_per_pallet', '파레트': 'cartons_per_pallet',

  // 추가 매핑 (Ingredients)
  '원료': 'ingredients', '원료명': 'ingredients', '원료 및 함량': 'ingredients', '함량': 'ingredients',

  // 마케팅 포인트
  '셀링포인트': 'selling_point', 'SellingPoint': 'selling_point', '판매포인트': 'selling_point',
  '제품특징': 'key_features', '특징': 'key_features', 'KeyFeatures': 'key_features', 'Features': 'key_features',
  '타겟': 'target_customer', '추천대상': 'target_customer', 'Target': 'target_customer',

  // 영문 키 직접 매핑 (사용자 시트 대응)
  'ingredients': 'ingredients',
  'stock_status': 'stock_status',
  'tags': 'tags',
  'key_features': 'key_features',
  'target_customer': 'target_customer',
  'selling_point': 'selling_point',
  'sort_order': 'sort_order'
};

var LOGISTICS_KEYS = [
  'logistics_barcode', 'product_weight_g', 'carton_weight_kg',
  'carton_width_mm', 'carton_depth_mm', 'carton_height_mm',
  'product_width_mm', 'product_depth_mm', 'product_height_mm',
  'units_per_carton', 'cartons_per_pallet'
];

function normalizeHeader(header) {
  if (!header) return "";
  return header.toString().trim()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[\(\)\[\]\%\.\,]/g, ''); // Remove ( ) [ ] % . ,
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚡ Supabase 동기화')
      .addItem('▶ 선택한 행 업로드 (Sheet → DB)', 'syncSelectedRow')
      .addItem('▶▶ 전체 시트 업로드 (Sheet → DB)', 'syncAllRows')
      .addSeparator()
      .addItem('◀ DB에서 불러오기 (DB → Sheet)', 'fetchFromSupabase')
      .addSeparator()
      .addItem('🔍 진단하기 (Debug)', 'debugFetchOneRow')
      .addToUi();
}

/**
 * Debug function to check what DB actually returns
 */
function debugFetchOneRow() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetName = sheet.getName();
  var tableName = SHEET_CONFIG[sheetName];
  if (!tableName) tableName = 'raw_materials'; // Default to raw_materials for debugging if unknown

  var url = SUPABASE_URL + '/rest/v1/' + tableName + '?select=*&limit=1';
  var options = {
    'method': 'get',
    'headers': {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
    },
    'muteHttpExceptions': true
  };

  try {
    var res = UrlFetchApp.fetch(url, options);
    var content = res.getContentText();
    
    if (res.getResponseCode() >= 300) {
        ui.alert('❌ DB 연결 실패: ' + content);
        return;
    }

    var data = JSON.parse(content);

    if (data.length > 0) {
      var row = data[0];
      ui.alert(
        '✅ DB 연결 성공!\n' +
        'Table: ' + tableName + '\n' +
        '첫번째 제품: ' + (row.product_name || '이름없음') + '\n' +
        '데이터 샘플: ' + JSON.stringify(row)
      );
    } else {
      ui.alert('⚠️ DB 연결 성공했으나 데이터가 없습니다.');
    }
  } catch (e) {
    ui.alert('❌ 에러 발생:\n' + e.toString());
  }
}

function fetchFromSupabase() {
  var ui = SpreadsheetApp.getUi();
  // Version Check
  ui.alert("🔄 스크립트 버전: v2.1 (Final Fix)\n업데이트 확인되었습니다.");

  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetName = sheet.getName();
  var tableName = SHEET_CONFIG[sheetName];

  if (!tableName) {
    ui.alert('현재 시트는 동기화 대상이 아닙니다. (시트명: 완제품, 원료)');
    return;
  }

  // Ask for confirmation
  var userResponse = ui.alert(
    '⚠️ 데이터 덮어쓰기 경고',
    '시트의 기존 데이터가 모두 삭제되고 DB 데이터로 덮어씌워집니다.\n계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (userResponse !== ui.Button.YES) {
    return;
  }

  // 1. Fetch Data
  var url = SUPABASE_URL + '/rest/v1/' + tableName + '?select=*';
  
  if (tableName === 'finished_goods') {
    url += ',product_logistics_specs(*)';
  }
  
  url += '&order=sort_order.asc.nullslast,id.asc';

  var options = {
    'method': 'get',
    'headers': {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
    },
    'muteHttpExceptions': true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() >= 300) {
      ui.alert('데이터 불러오기 실패: ' + response.getContentText());
      return;
    }

    var data = JSON.parse(response.getContentText());
    
    if (!data || data.length === 0) {
      ui.alert('DB에 데이터가 없습니다.');
      return;
    }

    // 2. Prepare Headers (Dynamic Update: Append Missing)
    var currentHeaders = [];
    var lastCol = sheet.getLastColumn();
    if (lastCol > 0) {
        currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    }
    
    // Check known headers
    var keyToColMap = {};
    for (var h = 0; h < currentHeaders.length; h++) {
        var headerName = currentHeaders[h].toString().trim();
        var dbKey = HEADER_MAP[headerName];
        
        // Robust Matching
        if (!dbKey) {
             var normalized = normalizeHeader(headerName);
             dbKey = HEADER_MAP[normalized];
             if (!dbKey) {
                 for (var k in HEADER_MAP) {
                     if (normalizeHeader(k) === normalized) {
                         dbKey = HEADER_MAP[k];
                         break;
                     }
                 }
             }
             // Keywords
             if (!dbKey) {
                if (normalized.indexOf('원재료') !== -1) dbKey = 'ingredients';
                else if (normalized.indexOf('카톤') !== -1 && (normalized.indexOf('가로') !== -1 || normalized.indexOf('폭') !== -1)) dbKey = 'carton_width_mm';
                else if (normalized.indexOf('카톤') !== -1 && (normalized.indexOf('세로') !== -1 || normalized.indexOf('깊이') !== -1)) dbKey = 'carton_depth_mm';
                else if (normalized.indexOf('카톤') !== -1 && normalized.indexOf('높이') !== -1) dbKey = 'carton_height_mm';
                else if (normalized.indexOf('제품') !== -1 && (normalized.indexOf('가로') !== -1 || normalized.indexOf('폭') !== -1)) dbKey = 'product_width_mm';
                else if (normalized.indexOf('제품') !== -1 && (normalized.indexOf('세로') !== -1 || normalized.indexOf('깊이') !== -1)) dbKey = 'product_depth_mm';
                else if (normalized.indexOf('제품') !== -1 && normalized.indexOf('높이') !== -1) dbKey = 'product_height_mm';
             }
        }

        // [Final Override] Fix specific mappings for raw_materials AFTER resolution
        if (tableName === 'raw_materials') {
             if (dbKey === 'cost_blind') dbKey = 'cost_price';
             if (headerName === '원가' || headerName === 'Cost') dbKey = 'cost_price';
        }
        
        if (dbKey) {
            keyToColMap[dbKey] = h;
        } else {
            // Also map exact matches (for id, etc)
            keyToColMap[headerName] = h;
        }
    }

    // Detect missing keys
    var allKeys = {};
    for (var i = 0; i < data.length; i++) {
        var rec = data[i];
        if (rec.product_logistics_specs && rec.product_logistics_specs.length > 0) {
             var spec = rec.product_logistics_specs[0];
             for (var k in spec) rec[k] = spec[k]; // Flatten for detection
        }
        for (var k in rec) {
            if (typeof rec[k] !== 'object' || rec[k] === null) allKeys[k] = true;
        }
    }

    // Append missing columns
    var newHeaders = [];
    var keys = Object.keys(allKeys);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === 'product_logistics_specs') continue;
        if (!keyToColMap.hasOwnProperty(key)) {
            // If the key is not mapped to any existing column, append it
            newHeaders.push(key);
            keyToColMap[key] = currentHeaders.length + newHeaders.length - 1;
        }
    }

    if (newHeaders.length > 0) {
        sheet.getRange(1, currentHeaders.length + 1, 1, newHeaders.length).setValues([newHeaders]);
        lastCol += newHeaders.length;
    }

    // Clear content
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
    }

    // 3. Map Data to Rows
    var outputRows = [];
    for (var i = 0; i < data.length; i++) {
        var record = data[i];
        if (record.product_logistics_specs && record.product_logistics_specs.length > 0) {
             var spec = record.product_logistics_specs[0];
             for (var k in spec) record[k] = spec[k];
        }

        var row = new Array(lastCol).fill("");
        
        for (var k in record) {
            if (keyToColMap.hasOwnProperty(k)) {
                var colIdx = keyToColMap[k];
                var val = record[k];

                if (Array.isArray(val)) val = val.join(', ');
                if (typeof val === 'string' && val.length >= 10 && val.charAt(4) === '-' && val.charAt(7) === '-') {
                     if (val.indexOf('T') !== -1) val = val.split('T')[0];
                }
                if (val === null || val === undefined) val = "";
                
                row[colIdx] = val;
            }
        }
        outputRows.push(row);
    }

    // 4. Write
    if (outputRows.length > 0) {
      sheet.getRange(2, 1, outputRows.length, outputRows[0].length).setValues(outputRows);
      ui.alert('✅ 불러오기 완료 (' + outputRows.length + '건)');
    } else {
      ui.alert('⚠️ 데이터를 가져왔으나 컬럼을 매핑할 수 없습니다.');
    }

  } catch (e) {
    ui.alert('오류 발생: ' + e.toString());
  }
}

function syncSelectedRow() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rowIndex = sheet.getActiveCell().getRow();
  if (rowIndex <= 1) { 
    SpreadsheetApp.getUi().alert('헤더 행은 업로드할 수 없습니다.'); 
    return; 
  }
  
  var result = processRow(sheet, rowIndex);
  if (result.success) {
    SpreadsheetApp.getUi().alert('✅ 업로드 성공');
  } else {
    SpreadsheetApp.getUi().alert('❌ 실패: ' + result.error);
  }
}

function syncAllRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  var ui = SpreadsheetApp.getUi();

  if (lastRow <= 1) { 
    ui.alert('데이터가 없습니다.'); 
    return; 
  }
  
  if (ui.alert('총 ' + (lastRow - 1) + '건을 업로드하시겠습니까? (Sheet → DB)', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  var success = 0;
  var fail = 0;
  var lastError = "";

  for (var i = 2; i <= lastRow; i++) {
    var res = processRow(sheet, i);
    if (res.success) {
      success++;
    } else {
      fail++;
      lastError = res.error;
      console.error('Row ' + i + ' fail: ' + res.error);
    }
  }

  ui.alert('완료!\n성공: ' + success + '건\n실패: ' + fail + '건\n(마지막 에러: ' + lastError + ')');
}

function processRow(sheet, rowIndex) {
  var sheetName = sheet.getName();
  var tableName = SHEET_CONFIG[sheetName];
  if (!tableName) return { success: false, error: '매핑된 테이블 없음' };

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

  var mainPayload = {};
  var logisticsPayload = {};
  var hasLogistics = false;

  for (var i = 0; i < headers.length; i++) {
    var rawHeader = headers[i].toString().trim();
    var val = rowData[i];
    
    // Skip empty values (null, undefined, empty string, or whitespace-only)
    if (val === null || val === undefined || val === "") continue;
    if (typeof val === 'string' && val.trim() === "") continue;

    // Resolve Key (Keyword Match)
    var dbKey = HEADER_MAP[rawHeader];
    
    // [Override] For raw_materials, map '원가' to 'cost_price'
    if (tableName === 'raw_materials') {
         if (rawHeader === '원가' || rawHeader === 'Cost') dbKey = 'cost_price';
    }

    if (!dbKey) {
            var normalized = normalizeHeader(rawHeader);
            dbKey = HEADER_MAP[normalized];
            if (!dbKey) {
                for (var k in HEADER_MAP) {
                    if (normalizeHeader(k) === normalized) {
                        dbKey = HEADER_MAP[k];
                        break;
                    }
                }
            }
            if (!dbKey) {
                if (normalized.indexOf('원재료') !== -1) dbKey = 'ingredients';
                else if (normalized.indexOf('카톤') !== -1 && (normalized.indexOf('가로') !== -1 || normalized.indexOf('폭') !== -1)) dbKey = 'carton_width_mm';
                else if (normalized.indexOf('카톤') !== -1 && (normalized.indexOf('세로') !== -1 || normalized.indexOf('깊이') !== -1)) dbKey = 'carton_depth_mm';
                else if (normalized.indexOf('카톤') !== -1 && normalized.indexOf('높이') !== -1) dbKey = 'carton_height_mm';
                else if (normalized.indexOf('제품') !== -1 && (normalized.indexOf('가로') !== -1 || normalized.indexOf('폭') !== -1)) dbKey = 'product_width_mm';
                else if (normalized.indexOf('제품') !== -1 && (normalized.indexOf('세로') !== -1 || normalized.indexOf('깊이') !== -1)) dbKey = 'product_depth_mm';
                else if (normalized.indexOf('제품') !== -1 && normalized.indexOf('높이') !== -1) dbKey = 'product_height_mm';
            }
    }
    
    if (!dbKey) continue;

    // Format
    if (dbKey.indexOf('date') !== -1) {
        // Date Handling
        if (val) {
             var d = new Date(val);
             if (!isNaN(d.getTime())) {
                 // Format to YYYY-MM-DD
                 var yyyy = d.getFullYear();
                 var mm = ('0' + (d.getMonth() + 1)).slice(-2);
                 var dd = ('0' + d.getDate()).slice(-2);
                 val = yyyy + '-' + mm + '-' + dd;
             }
        }
    } else if (['price', 'cost', 'wholesale', 'weight', 'width', 'depth', 'height', 'units', 'qty', 'mm', 'kg', 'g'].some(function(k) { return dbKey.indexOf(k) !== -1; })) {
        // Strict Numeric Handling (Prevent 22P02 errors)
        var strVal = (val === null || val === undefined) ? "" : String(val).replace(/,/g, '').trim();
        if (strVal !== '' && !isNaN(Number(strVal))) {
             val = Number(strVal);
        } else {
             val = null; // Invalid number (e.g. date in price column) -> Send null
        }
    } else if (typeof val === 'string') {
        val = val.trim();
    }

    if (tableName === 'finished_goods' && LOGISTICS_KEYS.indexOf(dbKey) !== -1) {
        logisticsPayload[dbKey] = val;
        hasLogistics = true;
    } else {
        mainPayload[dbKey] = val;
    }
  }

  if (!mainPayload['product_name']) return { success: false, error: '제품명 없음' };
  
  if (mainPayload['tags'] && typeof mainPayload['tags'] === 'string') {
      mainPayload['tags'] = mainPayload['tags'].split(',').map(function(t) { return t.trim(); });
  }

  if (mainPayload['key_features'] && typeof mainPayload['key_features'] === 'string') {
      mainPayload['key_features'] = mainPayload['key_features'].split(/[\n,]+/).map(function(t) { return t.trim(); }).filter(function(t) { return t.length > 0; });
  }

  var options = {
    'method': 'post',
    'headers': {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },
    'muteHttpExceptions': true
  };

  // Upsert Product
  var existingId = null;
  // Try to find existing product by name
  var searchUrl = SUPABASE_URL + '/rest/v1/' + tableName + '?product_name=eq.' + encodeURIComponent(mainPayload.product_name) + '&select=id';
  var searchRes = UrlFetchApp.fetch(searchUrl, { headers: options.headers });
  if (searchRes.getResponseCode() === 200) {
      var found = JSON.parse(searchRes.getContentText());
      if (found.length > 0) existingId = found[0].id;
  }

  var finalRes;
  if (existingId) {
      options.method = 'patch';
      options.payload = JSON.stringify(mainPayload);
      finalRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/' + tableName + '?id=eq.' + existingId, options);
  } else {
      options.method = 'post';
      options.payload = JSON.stringify(mainPayload);
      finalRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/' + tableName, options);
  }

  if (finalRes.getResponseCode() >= 300) return { success: false, error: finalRes.getContentText() };

  var resultData = JSON.parse(finalRes.getContentText());
  var productId = resultData[0] ? resultData[0].id : null;

  // Upsert Logistics
  if (hasLogistics && productId) {
      logisticsPayload['product_id'] = productId;
      
      var logSearchRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/product_logistics_specs?product_id=eq.' + productId + '&select=id', { headers: options.headers });
      
      var logMethod = 'post';
      var logUrl = SUPABASE_URL + '/rest/v1/product_logistics_specs';
      if (logSearchRes.getResponseCode() === 200 && JSON.parse(logSearchRes.getContentText()).length > 0) {
          logMethod = 'patch';
          logUrl += '?product_id=eq.' + productId;
      }
      
      var logRes = UrlFetchApp.fetch(logUrl, {
          method: logMethod,
          headers: options.headers,
          payload: JSON.stringify(logisticsPayload),
          muteHttpExceptions: true
      });
      if (logRes.getResponseCode() >= 300) return { success: false, error: 'Logistics Fail: ' + logRes.getContentText() };
  }

  return { success: true };
}
