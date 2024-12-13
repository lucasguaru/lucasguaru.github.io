const allApis = [
    {
        "entity": "Consignee",
        "id": 1000,
        "fields": [
            {
                "fieldName": "external_id",
                "id": 1001,
                "type": "string",
                "required": true,
                "description": "The unique identifier that the shipper uses to identify the consignee."
            },
            {
                "fieldName": "business_name",
                "id": 1002,
                "type": "string",
                "required": true,
                "description": "The name of the consignee company."
            },
            {
                "fieldName": "domicile_address_1",
                "id": 1003,
                "type": "string",
                "description": "The first line of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_address_2",
                "id": 1004,
                "type": "string",
                "description": "The second line of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_city",
                "id": 1005,
                "type": "string",
                "description": "The city of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_principle_subdivision",
                "id": 1006,
                "type": "string",
                "description": "The state / province / region of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_country",
                "id": 1007,
                "type": "string",
                "description": "The country of the consignee company headquarters address."
            },
            {
                "fieldName": "domicile_postal_code",
                "id": 1008,
                "type": "PostalCode_US",
                "description": "The postal code of the consignee company headquarters address."
            }
        ]
    },
    {
        "entity": "Facility",
        "id": 2000,
        "fields": [
            {
                "fieldName": "external_id",
                "id": 2001,
                "type": "string",
                "required": true,
                "description": "The unique identifier that the shipper uses to identify the facility."
            },
            {
                "fieldName": "name",
                "id": 2002,
                "type": "string",
                "required": true,
                "description": "The name that the shipper uses to identify the facility."
            },
            {
                "fieldName": "business_entity_id",
                "id": 2003,
                "type": "UUID",
                "requiredFor201": true,
                "description": "The ID of the business that operates out of the facility."
            },
            {
                "fieldName": "business_entity_type",
                "id": 2004,
                "type": "BusinessEntityType",
                "requiredFor201": true,
                "description": "The type of the business entity that operates out of the facility."
            },
            {
                "fieldName": "raw_address",
                "id": 2005,
                "type": "string",
                "required": true,
                "description": "The textual representation of the complete address for the facility."
            },
            {
                "fieldName": "report_id",
                "id": 2006,
                "type": "UUID",
                "description": "The ID of the report that this facility is associated with."
            }
        ]
    },
    {
        "entity": "Lane",
        "id": 3000,
        "fields": [
            {
                "fieldName": "external_id",
                "id": 3001,
                "type": "string",
                "required": true,
                "description": "The unique identifier that the shipper uses to identify the lane."
            }
        ]
    },
    {
        "entity": "PurchaseOrder",
        "id": 4000,
        "fields": [
            {
                "fieldName": "external_id",
                "id": 4001,
                "type": "string",
                "required": true,
                "description": "The external identifier (PO number) that the shipper and consignee uses to identify the purchase order."
            },
            {
                "fieldName": "consignee_id",
                "id": 4002,
                "type": "UUID",
                "required": true,
                "description": "The ID of the consignee this purchase order is associated with."
            },
            {
                "fieldName": "week_id",
                "id": 4003,
                "type": "UUID",
                "required": true,
                "description": "The ID of the week that this purchase order pertains to."
            },
            {
                "fieldName": "placed_at",
                "id": 4004,
                "type": "DateTime",
                "description": "The date and time that the consignee created (issued) the purchase order."
            },
            {
                "fieldName": "original_requested_arrival_at",
                "id": 4005,
                "type": "DateTime",
                "required": true,
                "description": "The date and time that the consignee requests to receive the purchase order."
            },
            {
                "fieldName": "unit_type",
                "id": 4006,
                "type": "string",
                "required": true,
                "description": "The type of packaging units comprised by the purchase order."
            },
            {
                "fieldName": "unit_quantity",
                "id": 4007,
                "type": "integer",
                "required": true,
                "description": "The amount packaging units comprised by the purchase order."
            },
            {
                "fieldName": "shipped_quantity",
                "id": 4008,
                "type": "number",
                "required": true,
                "description": "The amount packaging units that were actually shipped."
            },
            {
                "fieldName": "value",
                "id": 4009,
                "type": "number",
                "required": true,
                "description": "The monetary value of the purchase order."
            },
            {
                "fieldName": "value_currency_code",
                "id": 4010,
                "type": "CurrencyCode",
                "required": true,
                "description": "The currency code of monetary value of the purchase order."
            },
            {
                "fieldName": "linehaul_spend",
                "id": 4011,
                "type": "number",
                "description": "Payable base rate sliced by this order."
            },
            {
                "fieldName": "linehaul_spend_currency_code",
                "id": 4012,
                "type": "CurrencyCode",
                "description": "Currency code for linehaul_spend."
            },
            {
                "fieldName": "accessorial_value",
                "id": 4013,
                "type": "number",
                "description": "Total payable value of all accessorials sliced by this order."
            },
            {
                "fieldName": "accessorial_currency_code",
                "id": 4014,
                "type": "CurrencyCode",
                "description": "Currency code for accessorial_value."
            },
            {
                "fieldName": "fuel_surcharge",
                "id": 4015,
                "type": "number",
                "description": "Total payable fuel surcharge sliced by this order."
            },
            {
                "fieldName": "fuel_surcharge_currency_code",
                "id": 4016,
                "type": "CurrencyCode",
                "description": "Currency code for fuel_surcharge."
            },
            {
                "fieldName": "total_spend",
                "id": 4017,
                "type": "number",
                "description": "Total payable rate sliced by this order."
            },
            {
                "fieldName": "total_spend_currency_code",
                "id": 4018,
                "type": "CurrencyCode",
                "description": "Currency code for total_spend."
            },
            {
                "fieldName": "confirmed_delivery_date",
                "id": 4019,
                "type": "Date",
                "description": "The confirmed delivery date (CDD) for a purchase order. This is generally set by the shipper, based on what they can commit to."
            },
            {
                "fieldName": "report_id",
                "id": 4020,
                "type": "UUID",
                "description": "The ID of the report that this purchase order is associated with."
            }
        ]
    },
    {
        "entity": "Shipment",
        "id": 5000,
        "fields": [
            {
                "fieldName": "external_id",
                "id": 5001,
                "type": "string",
                "required": true,
                "description": "The external identifier that the shipper uses to identify the shipment."
            },
            {
                "fieldName": "week_id",
                "id": 5002,
                "type": "UUID",
                "required": true,
                "description": "The ID of the week that this shipment pertains to."
            },
            {
                "fieldName": "tracking_status",
                "id": 5003,
                "type": "TrackingStatus",
                "description": "Indicates the tracking compliance for the shipment. [TRACKED, TRACKED_CONSISTENTLY, UNTRACKED]"
            },
            {
                "fieldName": "rush",
                "id": 5004,
                "type": "boolean",
                "description": "Indicates whether the shipment is expedited."
            },
            {
                "fieldName": "fulfillment_type",
                "id": 5005,
                "type": "FulfillmentType",
                "description": "Represents the type of fulfillment operation being performed. [OUTBOUND, INBOUND, TRANSFER]"
            },
            {
                "fieldName": "mode",
                "id": 5006,
                "type": "string",
                "description": "The mode of transportation utilized to transport the goods. [INTERMODAL, LESS_THAN_TRUCKLOAD, TRUCKLOAD, CUSTOMER_PICKUP, DRAYAGE, FLATBED, PARCEL, REFRIGERATED_TRUCKLOAD, TANKER]"
            },
            {
                "fieldName": "equipment_type",
                "id": 5007,
                "type": "string",
                "description": "Type of equipment required to carry the shipment. [DRY_VAN, FLATBED, REFRIGERATED, CONTAINER, DRY_BULK_TANKER, POWER_ONLY, AUTO_CARRIER, STRAIGHT_BOX_TRUCK]"
            },
            {
                "fieldName": "legs",
                "id": 5008,
                "type": "array",
                "child": [
                    {
                        "fieldName": "carrier_id",
                        "id": 5009,
                        "type": "UUID",
                        "required": true,
                        "ref": "Carrier",
                        "description": "The ID of the carrier this leg is associated with."
                    },
                    {
                        "fieldName": "carrier_external_id",
                        "id": 5010,
                        "type": "string",
                        "required": true,
                        "description": "The unique identifier that the shipper uses to identify the carrier."
                    },
                    {
                        "fieldName": "start",
                        "id": 5011,
                        "type": "Stop",
                        "description": "The stop that the leg begins with.",
                        "child": [
                            {
                                "fieldName": "facility_id",
                                "id": 5012,
                                "type": "UUID",
                                "required": true,
                                "ref": "Facility",
                                "description": "The ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "facility_external_id",
                                "id": 5013,
                                "type": "string",
                                "required": true,
                                "description": "The external ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "tasks",
                                "id": 5014,
                                "type": "array",
                                "child": [
                                    {
                                        "fieldName": "business_entity_id",
                                        "id": 5015,
                                        "type": "UUID",
                                        "description": "The ID of the business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "business_entity_type",
                                        "id": 5016,
                                        "type": "BusinessEntityType",
                                        "description": "The type of business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "confirmed_date",
                                        "id": 5017,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
                                    },
                                    {
                                        "fieldName": "fulfillment_type",
                                        "id": 5018,
                                        "type": "FulfillmentType",
                                        "description": "The fulfillment strategy of the shipment. [OUTBOUND, INBOUND, TRANSFER]"
                                    },
                                    {
                                        "fieldName": "task_type",
                                        "id": 5019,
                                        "type": "StopTaskType",
                                        "description": "Indicates the type of task being performed at the stop. [PICKUP, DROPOFF]"
                                    },
                                    {
                                        "fieldName": "purchase_order_id",
                                        "id": 5020,
                                        "type": "UUID",
                                        "required": true,
                                        "description": "The ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "purchase_order_number",
                                        "id": 5021,
                                        "type": "string",
                                        "required": true,
                                        "description": "The external ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "requested_date",
                                        "id": 5022,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the requested delivery date (RDD) for a shipment. This is generally the earliest ORAD of the purchase orders that the shipment fulfills."
                                    }
                                ]
                            },
                            {
                                "fieldName": "original_scheduled_appointment_at",
                                "id": 5023,
                                "type": "DateTime",
                                "description": "The initial appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_at",
                                "id": 5024,
                                "type": "DateTime",
                                "description": "The final appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_started_at",
                                "id": 5025,
                                "type": "DateTime",
                                "description": "The start of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_ended_at",
                                "id": 5026,
                                "type": "DateTime",
                                "description": "The end of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_started_at",
                                "id": 5027,
                                "type": "DateTime",
                                "description": "The originally planned start of the appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_ended_at",
                                "id": 5028,
                                "type": "DateTime",
                                "description": "The originally planned end of the appointment window for this stop."
                            },
                            {
                                "fieldName": "arrived_at",
                                "id": 5029,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the carrier arrived at the stop."
                            },
                            {
                                "fieldName": "departed_at",
                                "id": 5030,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the carrier departed the stop."
                            },
                            {
                                "fieldName": "departure_time_entered_at",
                                "id": 5031,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the shipper received the carrier departure date and time."
                            },
                            {
                                "fieldName": "buffered_appointment_at",
                                "id": 5032,
                                "type": "DateTime",
                                "description": "The date and time of the buffer-adjusted appointment time for \"allowed lateness\"."
                            },
                            {
                                "fieldName": "estimated_date",
                                "id": 5033,
                                "type": "Date",
                                "description": "The estimated date of the of the pickup or delivery."
                            },
                            {
                                "fieldName": "reason_codes",
                                "id": 5034,
                                "type": "array",
                                "description": "Optional array of objects with reason code and exception type string combinations to indicate applicable reason codes for possible stop exceptions.",
                                "child": [
                                    {
                                        "fieldName": "exception_type",
                                        "id": 5035,
                                        "type": "string",
                                        "description": "The exception type the reason code should be applied to, if it occurred.\\\n            Example: 'late_delivery'."
                                    },
                                    {
                                        "fieldName": "code",
                                        "id": 5036,
                                        "type": "string",
                                        "description": "The reason code to be applied if the exception type specified occurs."
                                    }
                                ]
                            },
                            {
                                "fieldName": "sequence_number",
                                "id": 5037,
                                "type": "integer",
                                "required": true,
                                "description": "The ordinal number of the stop."
                            },
                            {
                                "fieldName": "trailer_operation",
                                "id": 5038,
                                "required": true,
                                "type": "TrailerOperation"
                            },
                            {
                                "fieldName": "trailer_operation_delay",
                                "id": 5039,
                                "type": "integer",
                                "description": "The number of seconds the carrier was delayed at a stop."
                            },
                            {
                                "fieldName": "appointment_created_at",
                                "id": 5040,
                                "type": "DateTime",
                                "description": "The date & time when the appointment was scheduled."
                            }
                        ]
                    },
                    {
                        "fieldName": "end",
                        "id": 5041,
                        "type": "Stop",
                        "description": "The stop that the leg ends with.",
                        "child": [
                            {
                                "fieldName": "facility_id",
                                "id": 5042,
                                "type": "UUID",
                                "required": true,
                                "ref": "Facility",
                                "description": "The ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "facility_external_id",
                                "id": 5043,
                                "type": "string",
                                "required": true,
                                "description": "The external ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "tasks",
                                "id": 5044,
                                "type": "array",
                                "child": [
                                    {
                                        "fieldName": "business_entity_id",
                                        "id": 5045,
                                        "type": "UUID",
                                        "required": true,
                                        "description": "The ID of the business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "business_entity_type",
                                        "id": 5046,
                                        "type": "BusinessEntityType",
                                        "required": true,
                                        "description": "The type of business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "confirmed_date",
                                        "id": 5047,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
                                    },
                                    {
                                        "fieldName": "fulfillment_type",
                                        "id": 5048,
                                        "type": "FulfillmentType",
                                        "description": "The fulfillment strategy of the shipment. [OUTBOUND, INBOUND, TRANSFER]"
                                    },
                                    {
                                        "fieldName": "task_type",
                                        "id": 5049,
                                        "required": true,
                                        "type": "StopTaskType",
                                        "description": "Indicates the type of task being performed at the stop. [PICKUP, DROPOFF]"
                                    },
                                    {
                                        "fieldName": "purchase_order_id",
                                        "id": 5050,
                                        "type": "UUID",
                                        "required": true,
                                        "description": "The ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "purchase_order_number",
                                        "id": 5051,
                                        "type": "string",
                                        "required": true,
                                        "description": "The external ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "requested_date",
                                        "id": 5052,
                                        "type": "Date",
                                        "required": true,
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the requested delivery date (RDD) for a shipment. This is generally the earliest ORAD of the purchase orders that the shipment fulfills."
                                    }
                                ]
                            },
                            {
                                "fieldName": "original_scheduled_appointment_at",
                                "id": 5053,
                                "type": "DateTime",
                                "description": "The initial appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_at",
                                "id": 5054,
                                "type": "DateTime",
                                "description": "The final appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_started_at",
                                "id": 5055,
                                "type": "DateTime",
                                "required": true,
                                "description": "The start of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_ended_at",
                                "id": 5056,
                                "type": "DateTime",
                                "required": true,
                                "description": "The end of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_started_at",
                                "id": 5057,
                                "type": "DateTime",
                                "description": "The originally planned start of the appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_ended_at",
                                "id": 5058,
                                "type": "DateTime",
                                "description": "The originally planned end of the appointment window for this stop."
                            },
                            {
                                "fieldName": "arrived_at",
                                "id": 5059,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the carrier arrived at the stop."
                            },
                            {
                                "fieldName": "departed_at",
                                "id": 5060,
                                "type": "DateTime",
                                "required": true,
                                "description": "The date and time that the carrier departed the stop."
                            },
                            {
                                "fieldName": "departure_time_entered_at",
                                "id": 5061,
                                "type": "DateTime",
                                "description": "The date and time that the shipper received the carrier departure date and time."
                            },
                            {
                                "fieldName": "buffered_appointment_at",
                                "id": 5062,
                                "type": "DateTime",
                                "description": "The date and time of the buffer-adjusted appointment time for \"allowed lateness\"."
                            },
                            {
                                "fieldName": "estimated_date",
                                "id": 5063,
                                "type": "Date",
                                "description": "The estimated date of the of the pickup or delivery."
                            },
                            {
                                "fieldName": "reason_codes",
                                "id": 5064,
                                "type": "array",
                                "description": "Optional array of objects with reason code and exception type string combinations to indicate applicable reason codes for possible stop exceptions.",
                                "child": [
                                    {
                                        "fieldName": "exception_type",
                                        "id": 5065,
                                        "type": "string",
                                        "description": "The exception type the reason code should be applied to, if it occurred.\\\n            Example: 'late_delivery'."
                                    },
                                    {
                                        "fieldName": "code",
                                        "id": 5066,
                                        "type": "string",
                                        "description": "The reason code to be applied if the exception type specified occurs."
                                    }
                                ]
                            },
                            {
                                "fieldName": "sequence_number",
                                "id": 5067,
                                "type": "integer",
                                "required": true,
                                "description": "The ordinal number of the stop."
                            },
                            {
                                "fieldName": "trailer_operation",
                                "id": 5068,
                                "required": true,
                                "type": "TrailerOperation"
                            },
                            {
                                "fieldName": "trailer_operation_delay",
                                "id": 5069,
                                "type": "integer",
                                "description": "The number of seconds the carrier was delayed at a stop."
                            },
                            {
                                "fieldName": "appointment_created_at",
                                "id": 5070,
                                "type": "DateTime",
                                "description": "The date & time when the appointment was scheduled."
                            }
                        ]
                    },
                    {
                        "fieldName": "distance",
                        "id": 5071,
                        "type": "number",
                        "description": "The distance amount between the start and end stops."
                    },
                    {
                        "fieldName": "distance_unit",
                        "id": 5072,
                        "type": "DistanceUnit"
                    },
                    {
                        "fieldName": "consignee_pickup",
                        "id": 5073,
                        "type": "boolean",
                        "description": "Indicates if the leg was executed by a consignee's carrier."
                    }
                ]
            },
            {
                "fieldName": "tenders",
                "id": 5074,
                "type": "array",
                "required": true,
                "child": "string"
            },
            {
                "fieldName": "report_id",
                "id": 5075,
                "type": "UUID",
                "description": "The ID of the report that this shipment is associated with."
            },
            {
                "fieldName": "multiple_stops",
                "id": 5076,
                "type": "boolean",
                "description": "Indicates whether the shipment is a multi-stop shipment (greater than two stops)."
            },
            {
                "fieldName": "region",
                "id": 5077,
                "type": "string",
                "description": "The region that this shipment is associated with."
            },
            {
                "fieldName": "delivery_numbers",
                "id": 5078,
                "type": "array",
                "description": "The delivery numbers associated with this shipment."
            },
            {
                "fieldName": "planner_user_name",
                "id": 5079,
                "type": "string",
                "description": "The full name of the user that planned the shipment (eg. \"John Smith\")."
            },
            {
                "fieldName": "linehaul_spend",
                "id": 5080,
                "required": true,
                "type": "number"
            },
            {
                "fieldName": "linehaul_spend_currency_code",
                "id": 5081,
                "required": true,
                "type": "CurrencyCode"
            },
            {
                "fieldName": "planned_total_spend",
                "id": 5082,
                "type": "number",
                "description": "The contracted rate negotiated to deliver the shipment."
            },
            {
                "fieldName": "planned_total_spend_currency_code",
                "id": 5083,
                "type": "CurrencyCode"
            },
            {
                "fieldName": "total_spend_value",
                "id": 5084,
                "type": "number",
                "description": "The final rate paid to deliver the shipment."
            },
            {
                "fieldName": "total_spend_currency_code",
                "id": 5085,
                "type": "CurrencyCode"
            },
            {
                "fieldName": "total_accessorial_value",
                "id": 5086,
                "type": "number",
                "description": "Total value of all accessorials for this shipment."
            },
            {
                "fieldName": "total_accessorial_currency_code",
                "id": 5087,
                "type": "CurrencyCode",
                "description": "Currency code for total_accessorial_value."
            },
            {
                "fieldName": "requested_delivery_date",
                "id": 5088,
                "type": "Date",
                "description": "The date that the consignee requests to receive the shipment. This is often the earliest ORAD of the purchase orders that the shipment fulfills."
            },
            {
                "fieldName": "confirmed_delivery_date",
                "id": 5089,
                "type": "Date",
                "description": "The confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
            },
            {
                "fieldName": "custom_data",
                "id": 5090,
                "type": "object",
                "description": "Arbitrary custom data to attach to the shipment for analytical purposes."
            },
            {
                "fieldName": "reporting_date",
                "id": 5091,
                "type": "Date",
                "description": "The date that the shipment should be anchored to in the context of date-based searches."
            },
            {
                "fieldName": "fuel_surcharge_value",
                "id": 5092,
                "type": "number",
                "description": "Fuel surcharge accessorial cost"
            },
            {
                "fieldName": "fuel_surcharge_currency_code",
                "id": 5093,
                "type": "CurrencyCode",
                "description": "Fuel surcharge accessorial cost currency code"
            },
            {
                "fieldName": "detention_value",
                "id": 5094,
                "type": "number",
                "description": "Detention cost (accessorial charge when driver is delayed)"
            },
            {
                "fieldName": "detention_currency_code",
                "id": 5095,
                "type": "CurrencyCode",
                "description": "Currency code for detention value"
            },
            {
                "fieldName": "other_accessorial_value",
                "id": 5096,
                "type": "number",
                "description": "Other accessorial cost value"
            },
            {
                "fieldName": "other_accessorial_currency_code",
                "id": 5097,
                "type": "CurrencyCode",
                "description": "Other accessorial value currency code"
            },
            {
                "fieldName": "customs_tax_value",
                "id": 5098,
                "type": "number",
                "description": "All tax amounts (e.g. customs taxes) associated with movement of a shipment"
            },
            {
                "fieldName": "customs_tax_currency_code",
                "id": 5099,
                "type": "CurrencyCode",
                "description": "Currency for customs tax value"
            },
            {
                "fieldName": "external_created_at",
                "id": 5100,
                "type": "DateTime",
                "description": "When was the shipment created in the partner system"
            }
        ]
    },
    {
        "entity": "Tender",
        "id": 6000,
        "fields": [
            {
                "fieldName": "external_id",
                "id": 6001,
                "type": "string",
                "required": true,
                "description": "The external identifier that the shipper uses to identify the tender."
            },
            {
                "fieldName": "carrier_id",
                "id": 6002,
                "type": "UUID",
                "required": true,
                "ref": "Carrier",
                "description": "The ID of the carrier this tender was issued to."
            },
            {
                "fieldName": "week_id",
                "id": 6003,
                "type": "UUID",
                "required": true,
                "ref": "Week",
                "description": "The ID of the week that this tender pertains to."
            },
            {
                "fieldName": "lane_id",
                "id": 6004,
                "type": "UUID",
                "description": "The ID of the lane that this tender is associated to."
            },
            {
                "fieldName": "sent_at",
                "id": 6005,
                "type": "DateTime",
                "description": "The date and time that the tender was sent to the carrier."
            },
            {
                "fieldName": "responded_at",
                "id": 6006,
                "type": "DateTime",
                "description": "The date and time that the carrier responded to the tender."
            },
            {
                "fieldName": "shipment_external_id",
                "id": 6007,
                "type": "string",
                "description": "The external identifier that the shipper uses to identify the shipment."
            },
            {
                "fieldName": "status",
                "id": 6008,
                "type": "TenderStatus"
            },
            {
                "fieldName": "tender_type",
                "id": 6009,
                "type": "TenderType"
            },
            {
                "fieldName": "sequence_number",
                "id": 6010,
                "type": "string",
                "description": "The ordinal number of the tender."
            },
            {
                "fieldName": "rush",
                "id": 6011,
                "type": "boolean",
                "description": "Indicates whether the shipment is expedited."
            },
            {
                "fieldName": "bid_status",
                "id": 6012,
                "type": "TenderBidStatus"
            },
            {
                "fieldName": "award_status",
                "id": 6013,
                "type": "TenderAwardStatus"
            },
            {
                "fieldName": "award_id",
                "id": 6014,
                "type": "UUID",
                "description": "The ID of the award that this tender is associated to."
            },
            {
                "fieldName": "fulfillment_type",
                "id": 6015,
                "type": "FulfillmentType"
            },
            {
                "fieldName": "method",
                "id": 6016,
                "type": "string",
                "description": "Indicates the decision process or circumstances behind how the carrier was selected for the tender."
            },
            {
                "fieldName": "legs",
                "id": 6017,
                "type": "array",
                "child": [
                    {
                        "fieldName": "carrier_id",
                        "id": 6018,
                        "type": "UUID",
                        "description": "The ID of the carrier this leg is associated with."
                    },
                    {
                        "fieldName": "carrier_external_id",
                        "id": 6019,
                        "type": "string",
                        "description": "The unique identifier that the shipper uses to identify the carrier."
                    },
                    {
                        "fieldName": "start",
                        "id": 6020,
                        "type": "Stop",
                        "description": "The stop that the leg begins with.",
                        "child": [
                            {
                                "fieldName": "facility_id",
                                "id": 6021,
                                "type": "UUID",
                                "description": "The ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "facility_external_id",
                                "id": 6022,
                                "type": "string",
                                "description": "The external ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "tasks",
                                "id": 6023,
                                "type": "array",
                                "child": [
                                    {
                                        "fieldName": "business_entity_id",
                                        "id": 6024,
                                        "type": "UUID",
                                        "description": "The ID of the business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "business_entity_type",
                                        "id": 6025,
                                        "type": "BusinessEntityType",
                                        "description": "The type of business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "confirmed_date",
                                        "id": 6026,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
                                    },
                                    {
                                        "fieldName": "fulfillment_type",
                                        "id": 6027,
                                        "type": "FulfillmentType",
                                        "description": "The fulfillment strategy of the shipment."
                                    },
                                    {
                                        "fieldName": "task_type",
                                        "id": 6028,
                                        "type": "StopTaskType"
                                    },
                                    {
                                        "fieldName": "purchase_order_id",
                                        "id": 6029,
                                        "type": "UUID",
                                        "description": "The ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "purchase_order_number",
                                        "id": 6030,
                                        "type": "string",
                                        "description": "The external ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "requested_date",
                                        "id": 6031,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the requested delivery date (RDD) for a shipment. This is generally the earliest ORAD of the purchase orders that the shipment fulfills."
                                    }
                                ]
                            },
                            {
                                "fieldName": "original_scheduled_appointment_at",
                                "id": 6032,
                                "type": "DateTime",
                                "description": "The initial appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_at",
                                "id": 6033,
                                "type": "DateTime",
                                "description": "The final appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_started_at",
                                "id": 6034,
                                "type": "DateTime",
                                "description": "The start of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_ended_at",
                                "id": 6035,
                                "type": "DateTime",
                                "description": "The end of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_started_at",
                                "id": 6036,
                                "type": "DateTime",
                                "description": "The originally planned start of the appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_ended_at",
                                "id": 6037,
                                "type": "DateTime",
                                "description": "The originally planned end of the appointment window for this stop."
                            },
                            {
                                "fieldName": "arrived_at",
                                "id": 6038,
                                "type": "DateTime",
                                "description": "The date and time that the carrier arrived at the stop."
                            },
                            {
                                "fieldName": "departed_at",
                                "id": 6039,
                                "type": "DateTime",
                                "description": "The date and time that the carrier departed the stop."
                            },
                            {
                                "fieldName": "departure_time_entered_at",
                                "id": 6040,
                                "type": "DateTime",
                                "description": "The date and time that the shipper received the carrier departure date and time."
                            },
                            {
                                "fieldName": "buffered_appointment_at",
                                "id": 6041,
                                "type": "DateTime",
                                "description": "The date and time of the buffer-adjusted appointment time for \"allowed lateness\"."
                            },
                            {
                                "fieldName": "estimated_date",
                                "id": 6042,
                                "type": "Date",
                                "description": "The estimated date of the of the pickup or delivery."
                            },
                            {
                                "fieldName": "reason_codes",
                                "id": 6043,
                                "type": "array",
                                "description": "Optional array of objects with reason code and exception type string combinations to indicate applicable reason codes for possible stop exceptions.",
                                "child": [
                                    {
                                        "fieldName": "exception_type",
                                        "id": 6044,
                                        "type": "string",
                                        "description": "The exception type the reason code should be applied to, if it occurred.\\\n            Example: 'late_delivery'."
                                    },
                                    {
                                        "fieldName": "code",
                                        "id": 6045,
                                        "type": "string",
                                        "description": "The reason code to be applied if the exception type specified occurs."
                                    }
                                ]
                            },
                            {
                                "fieldName": "sequence_number",
                                "id": 6046,
                                "type": "integer",
                                "description": "The ordinal number of the stop."
                            },
                            {
                                "fieldName": "trailer_operation",
                                "id": 6047,
                                "type": "TrailerOperation"
                            },
                            {
                                "fieldName": "trailer_operation_delay",
                                "id": 6048,
                                "type": "integer",
                                "description": "The number of seconds the carrier was delayed at a stop."
                            },
                            {
                                "fieldName": "appointment_created_at",
                                "id": 6049,
                                "type": "DateTime",
                                "description": "The date & time when the appointment was scheduled."
                            }
                        ]
                    },
                    {
                        "fieldName": "end",
                        "id": 6050,
                        "type": "Stop",
                        "description": "The stop that the leg ends with.",
                        "child": [
                            {
                                "fieldName": "facility_id",
                                "id": 6051,
                                "type": "UUID",
                                "description": "The ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "facility_external_id",
                                "id": 6052,
                                "type": "string",
                                "description": "The external ID of the facility where this stop occurs."
                            },
                            {
                                "fieldName": "tasks",
                                "id": 6053,
                                "type": "array",
                                "child": [
                                    {
                                        "fieldName": "business_entity_id",
                                        "id": 6054,
                                        "type": "UUID",
                                        "description": "The ID of the business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "business_entity_type",
                                        "id": 6055,
                                        "type": "BusinessEntityType",
                                        "description": "The type of business that the task is being performed for."
                                    },
                                    {
                                        "fieldName": "confirmed_date",
                                        "id": 6056,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the confirmed delivery date (CDD) for a shipment. This is generally set by the shipper, based on what they can commit to."
                                    },
                                    {
                                        "fieldName": "fulfillment_type",
                                        "id": 6057,
                                        "type": "FulfillmentType",
                                        "description": "The fulfillment strategy of the shipment."
                                    },
                                    {
                                        "fieldName": "task_type",
                                        "id": 6058,
                                        "type": "StopTaskType"
                                    },
                                    {
                                        "fieldName": "purchase_order_id",
                                        "id": 6059,
                                        "type": "UUID",
                                        "description": "The ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "purchase_order_number",
                                        "id": 6060,
                                        "type": "string",
                                        "description": "The external ID of the purchase order associated to the task."
                                    },
                                    {
                                        "fieldName": "requested_date",
                                        "id": 6061,
                                        "type": "Date",
                                        "description": "This is based on the context of the task. For example, for a dropoff task, this is the requested delivery date (RDD) for a shipment. This is generally the earliest ORAD of the purchase orders that the shipment fulfills."
                                    }
                                ]
                            },
                            {
                                "fieldName": "original_scheduled_appointment_at",
                                "id": 6062,
                                "type": "DateTime",
                                "description": "The initial appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_at",
                                "id": 6063,
                                "type": "DateTime",
                                "description": "The final appointment scheduled for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_started_at",
                                "id": 6064,
                                "type": "DateTime",
                                "description": "The start of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "scheduled_appointment_ended_at",
                                "id": 6065,
                                "type": "DateTime",
                                "description": "The end of the final appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_started_at",
                                "id": 6066,
                                "type": "DateTime",
                                "description": "The originally planned start of the appointment window for this stop."
                            },
                            {
                                "fieldName": "original_scheduled_appointment_ended_at",
                                "id": 6067,
                                "type": "DateTime",
                                "description": "The originally planned end of the appointment window for this stop."
                            },
                            {
                                "fieldName": "arrived_at",
                                "id": 6068,
                                "type": "DateTime",
                                "description": "The date and time that the carrier arrived at the stop."
                            },
                            {
                                "fieldName": "departed_at",
                                "id": 6069,
                                "type": "DateTime",
                                "description": "The date and time that the carrier departed the stop."
                            },
                            {
                                "fieldName": "departure_time_entered_at",
                                "id": 6070,
                                "type": "DateTime",
                                "description": "The date and time that the shipper received the carrier departure date and time."
                            },
                            {
                                "fieldName": "buffered_appointment_at",
                                "id": 6071,
                                "type": "DateTime",
                                "description": "The date and time of the buffer-adjusted appointment time for \"allowed lateness\"."
                            },
                            {
                                "fieldName": "estimated_date",
                                "id": 6072,
                                "type": "Date",
                                "description": "The estimated date of the of the pickup or delivery."
                            },
                            {
                                "fieldName": "reason_codes",
                                "id": 6073,
                                "type": "array",
                                "description": "Optional array of objects with reason code and exception type string combinations to indicate applicable reason codes for possible stop exceptions.",
                                "child": [
                                    {
                                        "fieldName": "exception_type",
                                        "id": 6074,
                                        "type": "string",
                                        "description": "The exception type the reason code should be applied to, if it occurred.\\\n            Example: 'late_delivery'."
                                    },
                                    {
                                        "fieldName": "code",
                                        "id": 6075,
                                        "type": "string",
                                        "description": "The reason code to be applied if the exception type specified occurs."
                                    }
                                ]
                            },
                            {
                                "fieldName": "sequence_number",
                                "id": 6076,
                                "type": "integer",
                                "description": "The ordinal number of the stop."
                            },
                            {
                                "fieldName": "trailer_operation",
                                "id": 6077,
                                "type": "TrailerOperation"
                            },
                            {
                                "fieldName": "trailer_operation_delay",
                                "id": 6078,
                                "type": "integer",
                                "description": "The number of seconds the carrier was delayed at a stop."
                            },
                            {
                                "fieldName": "appointment_created_at",
                                "id": 6079,
                                "type": "DateTime",
                                "description": "The date & time when the appointment was scheduled."
                            }
                        ]
                    },
                    {
                        "fieldName": "distance",
                        "id": 6080,
                        "type": "number",
                        "description": "The distance amount between the start and end stops."
                    },
                    {
                        "fieldName": "distance_unit",
                        "id": 6081,
                        "type": "DistanceUnit"
                    },
                    {
                        "fieldName": "consignee_pickup",
                        "id": 6082,
                        "type": "boolean",
                        "description": "Indicates if the leg was executed by a consignee's carrier."
                    }
                ]
            },
            {
                "fieldName": "report_id",
                "id": 6083,
                "type": "UUID",
                "description": "The ID of the report that this shipment is associated with."
            },
            {
                "fieldName": "multiple_stops",
                "id": 6084,
                "type": "boolean",
                "description": "Indicates whether the shipment is a multi-stop shipment (greater than two stops)."
            },
            {
                "fieldName": "region",
                "id": 6085,
                "type": "string",
                "description": "The region that this shipment is associated with."
            },
            {
                "fieldName": "delivery_numbers",
                "id": 6086,
                "type": "array",
                "description": "The delivery numbers associated with this shipment."
            },
            {
                "fieldName": "custom_data",
                "id": 6087,
                "type": "object",
                "description": "Arbitrary custom data to attach to the tender for analytical purposes."
            },
            {
                "fieldName": "reporting_date",
                "id": 6088,
                "type": "Date",
                "description": "The date that the tender should be anchored to in the context of date-based searches."
            }
        ]
    },
    {
        "entity": "Week",
        "id": 7000,
        "fields": [
            {
                "fieldName": "week",
                "id": 7001,
                "type": "integer",
                "description": "The ordinal number of week according to the shipper."
            },
            {
                "fieldName": "year",
                "id": 7002,
                "type": "integer",
                "description": "The calendar year of week."
            },
            {
                "fieldName": "started_at",
                "id": 7003,
                "type": "DateTime",
                "description": "The date and time that the week begins."
            },
            {
                "fieldName": "ended_at",
                "id": 7004,
                "type": "DateTime",
                "description": "The date and time that the week ends."
            }
        ]
    },
    {
        "entity": "PurchaseOrderShipperOrder",
        "id": 8000,
        "fields": [
            {
                "fieldName": "purchase_order_id",
                "id": 8001,
                "type": "string",
                "description": "The ID of the purchase order associated to the shipper order."
            },
            {
                "fieldName": "shipment_external_id",
                "id": 8002,
                "type": "string",
                "description": "The external identifier the shipper uses to identify the shipment."
            },
            {
                "fieldName": "shipper_order_number",
                "id": 8003,
                "type": "string",
                "description": "Identifier for the segment of a purchase order associated with a shipment\""
            },
            {
                "fieldName": "value",
                "id": 8004,
                "type": "number",
                "description": "Value of items in shipment as part of the purchase order whole."
            },
            {
                "fieldName": "value_currency_code",
                "id": 8005,
                "type": "string",
                "description": "Currency code for value field."
            }
        ]
    },
    {
        "entity": "Carrier",
        "id": 9000,
        "fields": [
            {
                "fieldName": "external_id",
                "id": 9002,
                "type": "string",
                "description": " The unique identifier that the shipper uses to identify the carrier."
            }
        ]
    }
]