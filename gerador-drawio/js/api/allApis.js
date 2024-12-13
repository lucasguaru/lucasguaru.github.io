const allApis = [
    {
        "entity": "Consignee",
        "id": 1000,
        "fields": [
            {
                "fieldName": "id",
                "id": 1001,
                "type": "UUID",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "external_id",
                "id": 1002,
                "type": "string",
                "required": true,
                "description": "The unique identifier that the shipper uses to identify the consignee."
            },
            {
                "fieldName": "business_name",
                "id": 1003,
                "type": "string",
                "required": true,
                "description": "The name of the consignee company."
            },
            {
                "fieldName": "domicile_address_1",
                "id": 1004,
                "type": "string",
                "description": "The first line of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_address_2",
                "id": 1005,
                "type": "string",
                "description": "The second line of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_city",
                "id": 1006,
                "type": "string",
                "description": "The city of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_principle_subdivision",
                "id": 1007,
                "type": "string",
                "description": "The state / province / region of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_country",
                "id": 1008,
                "type": "string",
                "description": "The country of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_postal_code",
                "id": 1009,
                "type": "PostalCode_US",
                "description": "The postal code of the consignee company headquarters address."
            }
        ]
    },
    {
        "entity": "FacilitySource",
        "id": 1010,
        "fields": [
            {
                "fieldName": "id",
                "id": 1011,
                "type": "UUID",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "external_id",
                "id": 1012,
                "type": "string",
                "required": true,
                "description": "The unique identifier that the shipper uses to identify the facility."
            },
            {
                "fieldName": "name",
                "id": 1013,
                "type": "string",
                "required": true,
                "description": "The name that the shipper uses to identify the facility."
            },
            {
                "fieldName": "business_entity_id",
                "id": 1014,
                "type": "UUID",
                "requiredFor201": true,
                "description": "The ID of the business that operates out of the facility."
            },
            {
                "fieldName": "business_entity_type",
                "id": 1015,
                "type": "BusinessEntityType",
                "requiredFor201": true,
                "description": "The type of the business entity that operates out of the facility."
            },
            {
                "fieldName": "raw_address",
                "id": 1016,
                "type": "string",
                "required": true,
                "description": "The textual representation of the complete address for the facility."
            },
            {
                "fieldName": "report_id",
                "id": 1017,
                "type": "UUID",
                "description": "The ID of the report that this facility is associated with."
            }
        ]
    },
    {
        "entity": "FacilityDestination",
        "id": 1018,
        "fields": [
            {
                "fieldName": "id",
                "id": 1019,
                "type": "UUID",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "external_id",
                "id": 1020,
                "type": "string",
                "required": true,
                "description": "The unique identifier that the shipper uses to identify the facility."
            },
            {
                "fieldName": "name",
                "id": 1021,
                "type": "string",
                "required": true,
                "description": "The name that the shipper uses to identify the facility."
            },
            {
                "fieldName": "business_entity_id",
                "id": 1022,
                "type": "UUID",
                "requiredFor201": true,
                "description": "The ID of the business that operates out of the facility."
            },
            {
                "fieldName": "business_entity_type",
                "id": 1023,
                "type": "BusinessEntityType",
                "requiredFor201": true,
                "description": "The type of the business entity that operates out of the facility."
            },
            {
                "fieldName": "raw_address",
                "id": 1024,
                "type": "string",
                "required": true,
                "description": "The textual representation of the complete address for the facility."
            },
            {
                "fieldName": "report_id",
                "id": 1025,
                "type": "UUID",
                "description": "The ID of the report that this facility is associated with."
            }
        ]
    },
    {
        "entity": "Lane",
        "id": 1026,
        "fields": [
            {
                "fieldName": "id",
                "id": 1027,
                "type": "string",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "external_id",
                "id": 1028,
                "type": "string",
                "required": true,
                "description": "The unique identifier that the shipper uses to identify the lane."
            }
        ]
    },
    {
        "entity": "PurchaseOrder",
        "id": 1029,
        "fields": [
            {
                "fieldName": "id",
                "id": 1030,
                "type": "UUID",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "external_id",
                "id": 1031,
                "type": "string",
                "required": true,
                "description": "The external identifier (PO number) that the shipper and consignee uses to identify the purchase order."
            },
            {
                "fieldName": "consignee_id",
                "id": 1032,
                "type": "UUID",
                "required": true,
                "description": "The ID of the consignee this purchase order is associated with."
            },
            {
                "fieldName": "week_id",
                "id": 1033,
                "type": "UUID",
                "required": true,
                "description": "The ID of the week that this purchase order pertains to."
            },
            {
                "fieldName": "placed_at",
                "id": 1034,
                "type": "DateTime",
                "description": "The date and time that the consignee created (issued) the purchase order."
            },
            {
                "fieldName": "original_requested_arrival_at",
                "id": 1035,
                "type": "DateTime",
                "required": true,
                "description": "The date and time that the consignee requests to receive the purchase order."
            },
            {
                "fieldName": "unit_type",
                "id": 1036,
                "type": "string",
                "required": true,
                "description": "The type of packaging units comprised by the purchase order."
            },
            {
                "fieldName": "unit_quantity",
                "id": 1037,
                "type": "integer",
                "required": true,
                "description": "The amount packaging units comprised by the purchase order."
            },
            {
                "fieldName": "shipped_quantity",
                "id": 1038,
                "type": "number",
                "required": true,
                "description": "The amount packaging units that were actually shipped."
            },
            {
                "fieldName": "value",
                "id": 1039,
                "type": "number",
                "required": true,
                "description": "The monetary value of the purchase order."
            },
            {
                "fieldName": "value_currency_code",
                "id": 1040,
                "type": "CurrencyCode",
                "required": true,
                "description": "The currency code of monetary value of the purchase order."
            },
            {
                "fieldName": "linehaul_spend",
                "id": 1041,
                "type": "number",
                "description": "Payable base rate sliced by this order."
            },
            {
                "fieldName": "linehaul_spend_currency_code",
                "id": 1042,
                "type": "CurrencyCode",
                "description": "Currency code for linehaul_spend."
            },
            {
                "fieldName": "accessorial_value",
                "id": 1043,
                "type": "number",
                "description": "Total payable value of all accessorials sliced by this order."
            },
            {
                "fieldName": "accessorial_currency_code",
                "id": 1044,
                "type": "CurrencyCode",
                "description": "Currency code for accessorial_value."
            },
            {
                "fieldName": "fuel_surcharge",
                "id": 1045,
                "type": "number",
                "description": "Total payable fuel surcharge sliced by this order."
            },
            {
                "fieldName": "fuel_surcharge_currency_code",
                "id": 1046,
                "type": "CurrencyCode",
                "description": "Currency code for fuel_surcharge."
            },
            {
                "fieldName": "total_spend",
                "id": 1047,
                "type": "number",
                "description": "Total payable rate sliced by this order."
            },
            {
                "fieldName": "total_spend_currency_code",
                "id": 1048,
                "type": "CurrencyCode",
                "description": "Currency code for total_spend."
            },
            {
                "fieldName": "credit_value",
                "id": 1049,
                "type": "number",
                "description": "Total value for all credits sliced by this order."
            },
            {
                "fieldName": "credit_currency_code",
                "id": 1050,
                "type": "CurrencyCode",
                "description": "Currency code for credit_value."
            },
            {
                "fieldName": "net_weight_in_pounds",
                "id": 1051,
                "type": "number",
                "description": "Net product weight in pounds in this order."
            },
            {
                "fieldName": "confirmed_delivery_date",
                "id": 1052,
                "type": "Date",
                "description": "The confirmed delivery date (CDD) for a purchase order. This is generally set by the shipper, based on what they can commit to."
            },
            {
                "fieldName": "report_id",
                "id": 1053,
                "type": "UUID",
                "description": "The ID of the report that this purchase order is associated with."
            },
            {
                "fieldName": "items",
                "id": 1054,
                "type": "array",
                "description": "A collection of goods purchased from the shipper by the consignee.",
                "child": [
                    {
                        "fieldName": "external_id",
                        "id": 1055,
                        "type": "string",
                        "description": "The external identifier the shipper and consignee uses to identify the purchase order item."
                    },
                    {
                        "fieldName": "unit_quantity",
                        "id": 1056,
                        "type": "number",
                        "description": "The number of packaging units stated in the purchase order."
                    },
                    {
                        "fieldName": "shipped_quantity",
                        "id": 1057,
                        "type": "number",
                        "description": "The number of packaging units that were actually shipped."
                    },
                    {
                        "fieldName": "value",
                        "id": 1058,
                        "type": "number",
                        "description": "The monetary value of the purchase order."
                    },
                    {
                        "fieldName": "value_currency_code",
                        "id": 1059,
                        "type": "CurrencyCode",
                        "description": "The currency code of monetary value of the purchase order."
                    }
                ]
            }
        ]
    },
    {
        "entity": "Shipment",
        "id": 1060,
        "fields": [
            {
                "fieldName": "id",
                "id": 1061,
                "type": "UUID",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "external_id",
                "id": 1062,
                "type": "string",
                "required": true,
                "description": "The external identifier that the shipper uses to identify the shipment."
            },
            {
                "fieldName": "week_id",
                "id": 1063,
                "type": "UUID",
                "required": true,
                "description": "The ID of the week that this shipment pertains to."
            },
            {
                "fieldName": "tracking_status",
                "id": 1064,
                "type": "TrackingStatus",
                "description": "Indicates the tracking compliance for the shipment. [TRACKED, TRACKED_CONSISTENTLY, UNTRACKED]"
            },
            {
                "fieldName": "rush",
                "id": 1065,
                "type": "boolean",
                "description": "Indicates whether the shipment is expedited."
            },
            {
                "fieldName": "fulfillment_type",
                "id": 1066,
                "type": "FulfillmentType",
                "description": "Represents the type of fulfillment operation being performed. [OUTBOUND, INBOUND, TRANSFER]"
            },
            {
                "fieldName": "mode",
                "id": 1067,
                "type": "string",
                "description": "The mode of transportation utilized to transport the goods. [INTERMODAL, LESS_THAN_TRUCKLOAD, TRUCKLOAD, CUSTOMER_PICKUP, DRAYAGE, FLATBED, PARCEL, REFRIGERATED_TRUCKLOAD, TANKER]"
            },
            {
                "fieldName": "equipment_type",
                "id": 1068,
                "type": "string",
                "description": "Type of equipment required to carry the shipment. [DRY_VAN, FLATBED, REFRIGERATED, CONTAINER, DRY_BULK_TANKER, POWER_ONLY, AUTO_CARRIER, STRAIGHT_BOX_TRUCK]"
            },
            {
                "fieldName": "legs",
                "id": 1069,
                "type": "array",
                "child": [
                    {
                        "fieldName": "carrier_id",
                        "id": 1070,
                        "type": "UUID",
                        "required": true,
                        "ref": "Carrier",
                        "description": "The ID of the carrier this leg is associated with."
                    },
                    {
                        "fieldName": "carrier_external_id",
                        "id": 1071,
                        "type": "string",
                        "required": true,
                        "description": "The unique identifier that the shipper uses to identify the carrier."
                    },
                    {
                        "fieldName": "start",
                        "id": 1072,
                        "type": "Stop",
                        "description": "The stop that the leg begins with.",
                        "child": [
                            {
                                "fieldName": "facility_id",
                                "id": 1073,
                                "type": "UUID",
                                "required": true,
                                "ref": "Facility",
                                "description": "The ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "facility_external_id",
                                "id": 1074,
                                "type": "string",
                                "required": true,
                                "description": "The external ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "tasks",
                                "id": 1075,
                                "type": "array",
                                "child": [
                                    {
                                        "fieldName": "business_entity_id",
                                        "id": 1076,
                                        "type": "UUID",
                                        "description": "The ID of the business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "business_entity_type",
                                        "id": 1077,
                                        "type": "BusinessEntityType",
                                        "description": "The type of business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "confirmed_date",
                                        "id": 1078,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
                                    },
                                    {
                                        "fieldName": "fulfillment_type",
                                        "id": 1079,
                                        "type": "FulfillmentType",
                                        "description": "The fulfillment strategy of the shipment. [OUTBOUND, INBOUND, TRANSFER]"
                                    },
                                    {
                                        "fieldName": "task_type",
                                        "id": 1080,
                                        "type": "StopTaskType",
                                        "description": "Indicates the type of task being performed at the stop. [PICKUP, DROPOFF]"
                                    },
                                    {
                                        "fieldName": "purchase_order_id",
                                        "id": 1081,
                                        "type": "UUID",
                                        "required": true,
                                        "description": "The ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "purchase_order_number",
                                        "id": 1082,
                                        "type": "string",
                                        "required": true,
                                        "description": "The external ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "requested_date",
                                        "id": 1083,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the requested delivery date (RDD) for a shipment. This is generally the earliest ORAD of the purchase orders that the shipment fulfills."
                                    }
                                ]
                            },
                            {
                                "fieldName": "original_scheduled_appointment_at",
                                "id": 1084,
                                "type": "DateTime",
                                "description": "The initial appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_at",
                                "id": 1085,
                                "type": "DateTime",
                                "description": "The final appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_started_at",
                                "id": 1086,
                                "type": "DateTime",
                                "description": "The start of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_ended_at",
                                "id": 1087,
                                "type": "DateTime",
                                "description": "The end of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_started_at",
                                "id": 1088,
                                "type": "DateTime",
                                "description": "The originally planned start of the appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_ended_at",
                                "id": 1089,
                                "type": "DateTime",
                                "description": "The originally planned end of the appointment window for this stop."
                            },
                            {
                                "fieldName": "arrived_at",
                                "id": 1090,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the carrier arrived at the stop."
                            },
                            {
                                "fieldName": "departed_at",
                                "id": 1091,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the carrier departed the stop."
                            },
                            {
                                "fieldName": "departure_time_entered_at",
                                "id": 1092,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the shipper received the carrier departure date and time."
                            },
                            {
                                "fieldName": "buffered_appointment_at",
                                "id": 1093,
                                "type": "DateTime",
                                "description": "The date and time of the buffer-adjusted appointment time for \"allowed lateness\"."
                            },
                            {
                                "fieldName": "estimated_date",
                                "id": 1094,
                                "type": "Date",
                                "description": "The estimated date of the of the pickup or delivery."
                            },
                            {
                                "fieldName": "reason_codes",
                                "id": 1095,
                                "type": "array",
                                "description": "Optional array of objects with reason code and exception type string combinations to indicate applicable reason codes for possible stop exceptions.",
                                "child": [
                                    {
                                        "fieldName": "exception_type",
                                        "id": 1096,
                                        "type": "string",
                                        "description": "The exception type the reason code should be applied to, if it occurred.\\\n            Example: 'late_delivery'."
                                    },
                                    {
                                        "fieldName": "code",
                                        "id": 1097,
                                        "type": "string",
                                        "description": "The reason code to be applied if the exception type specified occurs."
                                    }
                                ]
                            },
                            {
                                "fieldName": "sequence_number",
                                "id": 1098,
                                "type": "integer",
                                "required": true,
                                "description": "The ordinal number of the stop."
                            },
                            {
                                "fieldName": "trailer_operation",
                                "id": 1099,
                                "required": true,
                                "type": "TrailerOperation"
                            },
                            {
                                "fieldName": "trailer_operation_delay",
                                "id": 1100,
                                "type": "integer",
                                "description": "The number of seconds the carrier was delayed at a stop."
                            },
                            {
                                "fieldName": "appointment_created_at",
                                "id": 1101,
                                "type": "DateTime",
                                "description": "The date & time when the appointment was scheduled."
                            }
                        ]
                    },
                    {
                        "fieldName": "end",
                        "id": 1102,
                        "type": "Stop",
                        "description": "The stop that the leg ends with.",
                        "child": [
                            {
                                "fieldName": "facility_id",
                                "id": 1103,
                                "type": "UUID",
                                "required": true,
                                "ref": "Facility",
                                "description": "The ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "facility_external_id",
                                "id": 1104,
                                "type": "string",
                                "required": true,
                                "description": "The external ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "tasks",
                                "id": 1105,
                                "type": "array",
                                "child": [
                                    {
                                        "fieldName": "business_entity_id",
                                        "id": 1106,
                                        "type": "UUID",
                                        "required": true,
                                        "description": "The ID of the business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "business_entity_type",
                                        "id": 1107,
                                        "type": "BusinessEntityType",
                                        "required": true,
                                        "description": "The type of business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "confirmed_date",
                                        "id": 1108,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
                                    },
                                    {
                                        "fieldName": "fulfillment_type",
                                        "id": 1109,
                                        "type": "FulfillmentType",
                                        "description": "The fulfillment strategy of the shipment. [OUTBOUND, INBOUND, TRANSFER]"
                                    },
                                    {
                                        "fieldName": "task_type",
                                        "id": 1110,
                                        "required": true,
                                        "type": "StopTaskType",
                                        "description": "Indicates the type of task being performed at the stop. [PICKUP, DROPOFF]"
                                    },
                                    {
                                        "fieldName": "purchase_order_id",
                                        "id": 1111,
                                        "type": "UUID",
                                        "required": true,
                                        "description": "The ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "purchase_order_number",
                                        "id": 1112,
                                        "type": "string",
                                        "required": true,
                                        "description": "The external ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "requested_date",
                                        "id": 1113,
                                        "type": "Date",
                                        "required": true,
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the requested delivery date (RDD) for a shipment. This is generally the earliest ORAD of the purchase orders that the shipment fulfills."
                                    }
                                ]
                            },
                            {
                                "fieldName": "original_scheduled_appointment_at",
                                "id": 1114,
                                "type": "DateTime",
                                "description": "The initial appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_at",
                                "id": 1115,
                                "type": "DateTime",
                                "description": "The final appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_started_at",
                                "id": 1116,
                                "type": "DateTime",
                                "required": true,
                                "description": "The start of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_ended_at",
                                "id": 1117,
                                "type": "DateTime",
                                "required": true,
                                "description": "The end of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_started_at",
                                "id": 1118,
                                "type": "DateTime",
                                "description": "The originally planned start of the appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_ended_at",
                                "id": 1119,
                                "type": "DateTime",
                                "description": "The originally planned end of the appointment window for this stop."
                            },
                            {
                                "fieldName": "arrived_at",
                                "id": 1120,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the carrier arrived at the stop."
                            },
                            {
                                "fieldName": "departed_at",
                                "id": 1121,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the carrier departed the stop."
                            },
                            {
                                "fieldName": "departure_time_entered_at",
                                "id": 1122,
                                "type": "DateTime",
                                "description": "The date and time that the shipper received the carrier departure date and time."
                            },
                            {
                                "fieldName": "buffered_appointment_at",
                                "id": 1123,
                                "type": "DateTime",
                                "description": "The date and time of the buffer-adjusted appointment time for \"allowed lateness\"."
                            },
                            {
                                "fieldName": "estimated_date",
                                "id": 1124,
                                "type": "Date",
                                "description": "The estimated date of the of the pickup or delivery."
                            },
                            {
                                "fieldName": "reason_codes",
                                "id": 1125,
                                "type": "array",
                                "description": "Optional array of objects with reason code and exception type string combinations to indicate applicable reason codes for possible stop exceptions.",
                                "child": [
                                    {
                                        "fieldName": "exception_type",
                                        "id": 1126,
                                        "type": "string",
                                        "description": "The exception type the reason code should be applied to, if it occurred.\\\n            Example: 'late_delivery'."
                                    },
                                    {
                                        "fieldName": "code",
                                        "id": 1127,
                                        "type": "string",
                                        "description": "The reason code to be applied if the exception type specified occurs."
                                    }
                                ]
                            },
                            {
                                "fieldName": "sequence_number",
                                "id": 1128,
                                "type": "integer",
                                "required": true,
                                "description": "The ordinal number of the stop."
                            },
                            {
                                "fieldName": "trailer_operation",
                                "id": 1129,
                                "required": true,
                                "type": "TrailerOperation"
                            },
                            {
                                "fieldName": "trailer_operation_delay",
                                "id": 1130,
                                "type": "integer",
                                "description": "The number of seconds the carrier was delayed at a stop."
                            },
                            {
                                "fieldName": "appointment_created_at",
                                "id": 1131,
                                "type": "DateTime",
                                "description": "The date & time when the appointment was scheduled."
                            }
                        ]
                    },
                    {
                        "fieldName": "distance",
                        "id": 1132,
                        "type": "number",
                        "description": "The distance amount between the start and end stops."
                    },
                    {
                        "fieldName": "distance_unit",
                        "id": 1133,
                        "type": "DistanceUnit"
                    },
                    {
                        "fieldName": "consignee_pickup",
                        "id": 1134,
                        "type": "boolean",
                        "description": "Indicates if the leg was executed by a consignee's carrier."
                    }
                ]
            },
            {
                "fieldName": "tenders",
                "id": 1135,
                "type": "array",
                "required": true,
                "child": "string"
            },
            {
                "fieldName": "report_id",
                "id": 1136,
                "type": "UUID",
                "description": "The ID of the report that this shipment is associated with."
            },
            {
                "fieldName": "multiple_stops",
                "id": 1137,
                "type": "boolean",
                "description": "Indicates whether the shipment is a multi-stop shipment (greater than two stops)."
            },
            {
                "fieldName": "region",
                "id": 1138,
                "type": "string",
                "description": "The region that this shipment is associated with."
            },
            {
                "fieldName": "delivery_numbers",
                "id": 1139,
                "type": "array",
                "description": "The delivery numbers associated with this shipment."
            },
            {
                "fieldName": "planner_user_name",
                "id": 1140,
                "type": "string",
                "description": "The full name of the user that planned the shipment (eg. \"John Smith\")."
            },
            {
                "fieldName": "linehaul_spend",
                "id": 1141,
                "required": true,
                "type": "number"
            },
            {
                "fieldName": "linehaul_spend_currency_code",
                "id": 1142,
                "required": true,
                "type": "CurrencyCode"
            },
            {
                "fieldName": "planned_total_spend",
                "id": 1143,
                "type": "number",
                "description": "The contracted rate negotiated to deliver the shipment."
            },
            {
                "fieldName": "planned_total_spend_currency_code",
                "id": 1144,
                "type": "CurrencyCode"
            },
            {
                "fieldName": "total_spend_value",
                "id": 1145,
                "type": "number",
                "description": "The final rate paid to deliver the shipment."
            },
            {
                "fieldName": "total_spend_currency_code",
                "id": 1146,
                "type": "CurrencyCode"
            },
            {
                "fieldName": "total_accessorial_value",
                "id": 1147,
                "type": "number",
                "description": "Total value of all accessorials for this shipment."
            },
            {
                "fieldName": "total_accessorial_currency_code",
                "id": 1148,
                "type": "CurrencyCode",
                "description": "Currency code for total_accessorial_value."
            },
            {
                "fieldName": "requested_delivery_date",
                "id": 1149,
                "type": "Date",
                "description": "The date that the consignee requests to receive the shipment. This is often the earliest ORAD of the purchase orders that the shipment fulfills."
            },
            {
                "fieldName": "confirmed_delivery_date",
                "id": 1150,
                "type": "Date",
                "description": "The confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
            },
            {
                "fieldName": "custom_data",
                "id": 1151,
                "type": "object",
                "description": "Arbitrary custom data to attach to the shipment for analytical purposes."
            },
            {
                "fieldName": "reporting_date",
                "id": 1152,
                "type": "Date",
                "description": "The date that the shipment should be anchored to in the context of date-based searches."
            },
            {
                "fieldName": "fuel_surcharge_value",
                "id": 1153,
                "type": "number",
                "description": "Fuel surcharge accessorial cost"
            },
            {
                "fieldName": "fuel_surcharge_currency_code",
                "id": 1154,
                "type": "CurrencyCode",
                "description": "Fuel surcharge accessorial cost currency code"
            },
            {
                "fieldName": "detention_value",
                "id": 1155,
                "type": "number",
                "description": "Detention cost (accessorial charge when driver is delayed)"
            },
            {
                "fieldName": "detention_currency_code",
                "id": 1156,
                "type": "CurrencyCode",
                "description": "Currency code for detention value"
            },
            {
                "fieldName": "other_accessorial_value",
                "id": 1157,
                "type": "number",
                "description": "Other accessorial cost value"
            },
            {
                "fieldName": "other_accessorial_currency_code",
                "id": 1158,
                "type": "CurrencyCode",
                "description": "Other accessorial value currency code"
            },
            {
                "fieldName": "customs_tax_value",
                "id": 1159,
                "type": "number",
                "description": "All tax amounts (e.g. customs taxes) associated with movement of a shipment"
            },
            {
                "fieldName": "customs_tax_currency_code",
                "id": 1160,
                "type": "CurrencyCode",
                "description": "Currency for customs tax value"
            },
            {
                "fieldName": "external_created_at",
                "id": 1161,
                "type": "DateTime",
                "description": "When was the shipment created in the partner system"
            }
        ]
    },
    {
        "entity": "Tender",
        "id": 1162,
        "fields": [
            {
                "fieldName": "id",
                "id": 1163,
                "type": "UUID",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "external_id",
                "id": 1164,
                "type": "string",
                "required": true,
                "description": "The external identifier that the shipper uses to identify the tender."
            },
            {
                "fieldName": "carrier_id",
                "id": 1165,
                "type": "UUID",
                "required": true,
                "ref": "Carrier",
                "description": "The ID of the carrier this tender was issued to."
            },
            {
                "fieldName": "week_id",
                "id": 1166,
                "type": "UUID",
                "required": true,
                "ref": "Week",
                "description": "The ID of the week that this tender pertains to."
            },
            {
                "fieldName": "lane_id",
                "id": 1167,
                "type": "UUID",
                "description": "The ID of the lane that this tender is associated to."
            },
            {
                "fieldName": "sent_at",
                "id": 1168,
                "type": "DateTime",
                "description": "The date and time that the tender was sent to the carrier."
            },
            {
                "fieldName": "responded_at",
                "id": 1169,
                "type": "DateTime",
                "description": "The date and time that the carrier responded to the tender."
            },
            {
                "fieldName": "shipment_external_id",
                "id": 1170,
                "type": "string",
                "description": "The external identifier that the shipper uses to identify the shipment."
            },
            {
                "fieldName": "status",
                "id": 1171,
                "type": "TenderStatus"
            },
            {
                "fieldName": "tender_type",
                "id": 1172,
                "type": "TenderType"
            },
            {
                "fieldName": "sequence_number",
                "id": 1173,
                "type": "string",
                "description": "The ordinal number of the tender."
            },
            {
                "fieldName": "rush",
                "id": 1174,
                "type": "boolean",
                "description": "Indicates whether the shipment is expedited."
            },
            {
                "fieldName": "bid_status",
                "id": 1175,
                "type": "TenderBidStatus"
            },
            {
                "fieldName": "award_status",
                "id": 1176,
                "type": "TenderAwardStatus"
            },
            {
                "fieldName": "award_id",
                "id": 1177,
                "type": "UUID",
                "description": "The ID of the award that this tender is associated to."
            },
            {
                "fieldName": "fulfillment_type",
                "id": 1178,
                "type": "FulfillmentType"
            },
            {
                "fieldName": "method",
                "id": 1179,
                "type": "string",
                "description": "Indicates the decision process or circumstances behind how the carrier was selected for the tender."
            },
            {
                "fieldName": "legs",
                "id": 1180,
                "type": "array",
                "child": [
                    {
                        "fieldName": "carrier_id",
                        "id": 1181,
                        "type": "UUID",
                        "description": "The ID of the carrier this leg is associated with."
                    },
                    {
                        "fieldName": "carrier_external_id",
                        "id": 1182,
                        "type": "string",
                        "description": "The unique identifier that the shipper uses to identify the carrier."
                    },
                    {
                        "fieldName": "start",
                        "id": 1183,
                        "type": "Stop",
                        "description": "The stop that the leg begins with.",
                        "child": [
                            {
                                "fieldName": "facility_id",
                                "id": 1184,
                                "type": "UUID",
                                "description": "The ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "facility_external_id",
                                "id": 1185,
                                "type": "string",
                                "description": "The external ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "tasks",
                                "id": 1186,
                                "type": "array",
                                "child": [
                                    {
                                        "fieldName": "business_entity_id",
                                        "id": 1187,
                                        "type": "UUID",
                                        "description": "The ID of the business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "business_entity_type",
                                        "id": 1188,
                                        "type": "BusinessEntityType",
                                        "description": "The type of business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "confirmed_date",
                                        "id": 1189,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
                                    },
                                    {
                                        "fieldName": "fulfillment_type",
                                        "id": 1190,
                                        "type": "FulfillmentType",
                                        "description": "The fulfillment strategy of the shipment."
                                    },
                                    {
                                        "fieldName": "task_type",
                                        "id": 1191,
                                        "type": "StopTaskType"
                                    },
                                    {
                                        "fieldName": "purchase_order_id",
                                        "id": 1192,
                                        "type": "UUID",
                                        "description": "The ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "purchase_order_number",
                                        "id": 1193,
                                        "type": "string",
                                        "description": "The external ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "requested_date",
                                        "id": 1194,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the requested delivery date (RDD) for a shipment. This is generally the earliest ORAD of the purchase orders that the shipment fulfills."
                                    }
                                ]
                            },
                            {
                                "fieldName": "original_scheduled_appointment_at",
                                "id": 1195,
                                "type": "DateTime",
                                "description": "The initial appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_at",
                                "id": 1196,
                                "type": "DateTime",
                                "description": "The final appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_started_at",
                                "id": 1197,
                                "type": "DateTime",
                                "description": "The start of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_ended_at",
                                "id": 1198,
                                "type": "DateTime",
                                "description": "The end of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_started_at",
                                "id": 1199,
                                "type": "DateTime",
                                "description": "The originally planned start of the appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_ended_at",
                                "id": 1200,
                                "type": "DateTime",
                                "description": "The originally planned end of the appointment window for this stop."
                            },
                            {
                                "fieldName": "arrived_at",
                                "id": 1201,
                                "type": "DateTime",
                                "description": "The date and time that the carrier arrived at the stop."
                            },
                            {
                                "fieldName": "departed_at",
                                "id": 1202,
                                "type": "DateTime",
                                "description": "The date and time that the carrier departed the stop."
                            },
                            {
                                "fieldName": "departure_time_entered_at",
                                "id": 1203,
                                "type": "DateTime",
                                "description": "The date and time that the shipper received the carrier departure date and time."
                            },
                            {
                                "fieldName": "buffered_appointment_at",
                                "id": 1204,
                                "type": "DateTime",
                                "description": "The date and time of the buffer-adjusted appointment time for \"allowed lateness\"."
                            },
                            {
                                "fieldName": "estimated_date",
                                "id": 1205,
                                "type": "Date",
                                "description": "The estimated date of the of the pickup or delivery."
                            },
                            {
                                "fieldName": "reason_codes",
                                "id": 1206,
                                "type": "array",
                                "description": "Optional array of objects with reason code and exception type string combinations to indicate applicable reason codes for possible stop exceptions.",
                                "child": [
                                    {
                                        "fieldName": "exception_type",
                                        "id": 1207,
                                        "type": "string",
                                        "description": "The exception type the reason code should be applied to, if it occurred.\\\n            Example: 'late_delivery'."
                                    },
                                    {
                                        "fieldName": "code",
                                        "id": 1208,
                                        "type": "string",
                                        "description": "The reason code to be applied if the exception type specified occurs."
                                    }
                                ]
                            },
                            {
                                "fieldName": "sequence_number",
                                "id": 1209,
                                "type": "integer",
                                "description": "The ordinal number of the stop."
                            },
                            {
                                "fieldName": "trailer_operation",
                                "id": 1210,
                                "type": "TrailerOperation"
                            },
                            {
                                "fieldName": "trailer_operation_delay",
                                "id": 1211,
                                "type": "integer",
                                "description": "The number of seconds the carrier was delayed at a stop."
                            },
                            {
                                "fieldName": "appointment_created_at",
                                "id": 1212,
                                "type": "DateTime",
                                "description": "The date & time when the appointment was scheduled."
                            }
                        ]
                    },
                    {
                        "fieldName": "end",
                        "id": 1213,
                        "type": "Stop",
                        "description": "The stop that the leg ends with.",
                        "child": [
                            {
                                "fieldName": "facility_id",
                                "id": 1214,
                                "type": "UUID",
                                "description": "The ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "facility_external_id",
                                "id": 1215,
                                "type": "string",
                                "description": "The external ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "tasks",
                                "id": 1216,
                                "type": "array",
                                "child": [
                                    {
                                        "fieldName": "business_entity_id",
                                        "id": 1217,
                                        "type": "UUID",
                                        "description": "The ID of the business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "business_entity_type",
                                        "id": 1218,
                                        "type": "BusinessEntityType",
                                        "description": "The type of business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "confirmed_date",
                                        "id": 1219,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
                                    },
                                    {
                                        "fieldName": "fulfillment_type",
                                        "id": 1220,
                                        "type": "FulfillmentType",
                                        "description": "The fulfillment strategy of the shipment."
                                    },
                                    {
                                        "fieldName": "task_type",
                                        "id": 1221,
                                        "type": "StopTaskType"
                                    },
                                    {
                                        "fieldName": "purchase_order_id",
                                        "id": 1222,
                                        "type": "UUID",
                                        "description": "The ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "purchase_order_number",
                                        "id": 1223,
                                        "type": "string",
                                        "description": "The external ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "requested_date",
                                        "id": 1224,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the requested delivery date (RDD) for a shipment. This is generally the earliest ORAD of the purchase orders that the shipment fulfills."
                                    }
                                ]
                            },
                            {
                                "fieldName": "original_scheduled_appointment_at",
                                "id": 1225,
                                "type": "DateTime",
                                "description": "The initial appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_at",
                                "id": 1226,
                                "type": "DateTime",
                                "description": "The final appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_started_at",
                                "id": 1227,
                                "type": "DateTime",
                                "description": "The start of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_ended_at",
                                "id": 1228,
                                "type": "DateTime",
                                "description": "The end of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_started_at",
                                "id": 1229,
                                "type": "DateTime",
                                "description": "The originally planned start of the appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_ended_at",
                                "id": 1230,
                                "type": "DateTime",
                                "description": "The originally planned end of the appointment window for this stop."
                            },
                            {
                                "fieldName": "arrived_at",
                                "id": 1231,
                                "type": "DateTime",
                                "description": "The date and time that the carrier arrived at the stop."
                            },
                            {
                                "fieldName": "departed_at",
                                "id": 1232,
                                "type": "DateTime",
                                "description": "The date and time that the carrier departed the stop."
                            },
                            {
                                "fieldName": "departure_time_entered_at",
                                "id": 1233,
                                "type": "DateTime",
                                "description": "The date and time that the shipper received the carrier departure date and time."
                            },
                            {
                                "fieldName": "buffered_appointment_at",
                                "id": 1234,
                                "type": "DateTime",
                                "description": "The date and time of the buffer-adjusted appointment time for \"allowed lateness\"."
                            },
                            {
                                "fieldName": "estimated_date",
                                "id": 1235,
                                "type": "Date",
                                "description": "The estimated date of the of the pickup or delivery."
                            },
                            {
                                "fieldName": "reason_codes",
                                "id": 1236,
                                "type": "array",
                                "description": "Optional array of objects with reason code and exception type string combinations to indicate applicable reason codes for possible stop exceptions.",
                                "child": [
                                    {
                                        "fieldName": "exception_type",
                                        "id": 1237,
                                        "type": "string",
                                        "description": "The exception type the reason code should be applied to, if it occurred.\\\n            Example: 'late_delivery'."
                                    },
                                    {
                                        "fieldName": "code",
                                        "id": 1238,
                                        "type": "string",
                                        "description": "The reason code to be applied if the exception type specified occurs."
                                    }
                                ]
                            },
                            {
                                "fieldName": "sequence_number",
                                "id": 1239,
                                "type": "integer",
                                "description": "The ordinal number of the stop."
                            },
                            {
                                "fieldName": "trailer_operation",
                                "id": 1240,
                                "type": "TrailerOperation"
                            },
                            {
                                "fieldName": "trailer_operation_delay",
                                "id": 1241,
                                "type": "integer",
                                "description": "The number of seconds the carrier was delayed at a stop."
                            },
                            {
                                "fieldName": "appointment_created_at",
                                "id": 1242,
                                "type": "DateTime",
                                "description": "The date & time when the appointment was scheduled."
                            }
                        ]
                    },
                    {
                        "fieldName": "distance",
                        "id": 1243,
                        "type": "number",
                        "description": "The distance amount between the start and end stops."
                    },
                    {
                        "fieldName": "distance_unit",
                        "id": 1244,
                        "type": "DistanceUnit"
                    },
                    {
                        "fieldName": "consignee_pickup",
                        "id": 1245,
                        "type": "boolean",
                        "description": "Indicates if the leg was executed by a consignee's carrier."
                    }
                ]
            },
            {
                "fieldName": "report_id",
                "id": 1246,
                "type": "UUID",
                "description": "The ID of the report that this shipment is associated with."
            },
            {
                "fieldName": "multiple_stops",
                "id": 1247,
                "type": "boolean",
                "description": "Indicates whether the shipment is a multi-stop shipment (greater than two stops)."
            },
            {
                "fieldName": "region",
                "id": 1248,
                "type": "string",
                "description": "The region that this shipment is associated with."
            },
            {
                "fieldName": "delivery_numbers",
                "id": 1249,
                "type": "array",
                "description": "The delivery numbers associated with this shipment."
            },
            {
                "fieldName": "custom_data",
                "id": 1250,
                "type": "object",
                "description": "Arbitrary custom data to attach to the tender for analytical purposes."
            },
            {
                "fieldName": "reporting_date",
                "id": 1251,
                "type": "Date",
                "description": "The date that the tender should be anchored to in the context of date-based searches."
            }
        ]
    },
    {
        "entity": "Week",
        "id": 1252,
        "fields": [
            {
                "fieldName": "id",
                "id": 1253,
                "type": "UUID",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "week",
                "id": 1254,
                "type": "integer",
                "description": "The ordinal number of week according to the shipper."
            },
            {
                "fieldName": "year",
                "id": 1255,
                "type": "integer",
                "description": "The calendar year of week."
            },
            {
                "fieldName": "started_at",
                "id": 1256,
                "type": "DateTime",
                "description": "The date and time that the week begins."
            },
            {
                "fieldName": "ended_at",
                "id": 1257,
                "type": "DateTime",
                "description": "The date and time that the week ends."
            },
            {
                "fieldName": "date",
                "id": 1258,
                "type": "DateTime",
                "description": "The date and time to search week."
            }
        ]
    },
    {
        "entity": "PurchaseOrderShipperOrder",
        "id": 1259,
        "fields": [
            {
                "fieldName": "purchase_order_id",
                "id": 1260,
                "type": "string",
                "description": "The ID of the purchase order associated to the shipper order."
            },
            {
                "fieldName": "shipment_external_id",
                "id": 1261,
                "type": "string",
                "description": "The external identifier the shipper uses to identify the shipment."
            },
            {
                "fieldName": "shipper_order_number",
                "id": 1262,
                "type": "string",
                "description": "Identifier for the segment of a purchase order associated with a shipment\""
            },
            {
                "fieldName": "value",
                "id": 1263,
                "type": "number",
                "description": "Value of items in shipment as part of the purchase order whole."
            },
            {
                "fieldName": "value_currency_code",
                "id": 1264,
                "type": "string",
                "description": "Currency code for value field."
            }
        ]
    },
    {
        "entity": "Carrier",
        "id": 1265,
        "fields": [
            {
                "fieldName": "id",
                "id": 1266,
                "type": "UUID",
                "description": "Iso internal ID."
            },
            {
                "fieldName": "external_id",
                "id": 1267,
                "type": "string",
                "description": " The unique identifier that the shipper uses to identify the carrier."
            }
        ]
    }
]